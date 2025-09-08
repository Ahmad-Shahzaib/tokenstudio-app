import React, { useState, useMemo, useRef } from 'react';
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  ComputeBudgetProgram,
  TransactionInstruction,
  BlockhashWithExpiryBlockHeight,
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
} from '@solana/spl-token';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  Send,
  Upload,
  Download,
  Zap,
  Calculator,
  StopCircle,
} from 'lucide-react';
import SEO from '../components/SEO';

/** =======================
 *  CONFIG (devnet tuned)
 *  ======================= */
const PLATFORM_WALLET = new PublicKey('CWMFuRNeisP5EGbfVpzgfrQrYeaic3zvP6DpFonbTPRW');

// Fee your platform charges per recipient (in SOL)
const SOL_PER_ADDRESS = 0.008;

// Smaller batches are more reliable on devnet
const BATCH_SIZE = 15;

// Retry behavior
const MAX_RETRIES = 5;
const BASE_RETRY_DELAY_MS = 700; // backoff base

// Priority fee (microLamports per CU). Keep reasonable on devnet.
const PRIORITY_FEE_MICRO_LAMPORTS = 10_000;

// Max for getMultipleAccountsInfo in one call
const ATA_BATCH_SIZE = 100;

// Recommend a sensible upper bound to avoid wallet/provider limits
const MAX_RECIPIENTS = 500;

// Delay between sending successive txs to avoid rate limits
const SEND_DELAY_MS = 500;

/** =======================
 *  TYPES
 *  ======================= */
interface CsvData {
  address: string;
  amount?: number;
}

interface TransactionResult {
  address: string;
  status: 'success' | 'failed';
  error?: string;
}

/** =======================
 *  HELPERS
 *  ======================= */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Convert a UI amount to base units precisely (avoids float drift) */
function toBaseUnits(amountUi: number, decimals: number): bigint {
  if (amountUi <= 0) return 0n;
  const [whole, frac = ''] = amountUi.toString().split('.');
  const fracPadded = (frac + '0'.repeat(decimals)).slice(0, decimals);
  return BigInt(whole || '0') * BigInt(10 ** decimals) + BigInt(fracPadded || '0');
}

/** Exponential backoff delay */
function backoffDelay(attempt: number) {
  return BASE_RETRY_DELAY_MS * Math.min(8, 2 ** (attempt - 1));
}

/** =======================
 *  COMPONENT
 *  ======================= */
export default function AirdropPage() {
  const { connected, publicKey, signTransaction } = useWallet();

  const [tokenAddress, setTokenAddress] = useState('');
  const [wallets, setWallets] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<TransactionResult[]>([]);
  const [csvData, setCsvData] = useState<CsvData[]>([]);
  const [showCsvPreview, setShowCsvPreview] = useState(false);
  const [useCustomAmounts, setUseCustomAmounts] = useState(false);
  const [feePaid, setFeePaid] = useState(false);

  // Helius devnet RPC with confirmed commitment for stability
  const connection = useMemo(
    () =>
      new Connection(
        'https://mainnet.helius-rpc.com/?api-key=cf83b40d-47c1-4e6d-ac47-cdf35e878b6d',
        { commitment: 'confirmed' }
      ),
    []
  );

  const abortController = useRef(new AbortController());

  const calculateTotalFee = () => {
    const recipientCount = useCustomAmounts ? csvData.length : wallets.split('\n').filter((addr) => addr.trim()).length;
    return recipientCount * SOL_PER_ADDRESS;
  };

  const generateDemoCSV = () => {
    const demoData = [
      'address,amount',
      '8jz9D2xhVQJ5o9SDFfA3VZ7N8qF8Jp6mW8aB1At2m9mG,100',
      '3qHh9p3kKQb2vJz9Q9KxQyH2vZpG1L8n8b4oB2vH4z9P,250',
      '5fWwqJr3Qj7iBzL8KxHhXoQk9Fo9pZ0Yj3nGa4uQz2Qd,500',
      '7nGyqKj3Yh8LoPq9Vb3Yh7Qk2Wq9Lo1Yp8UoKj3Ly6Tq,75',
      '9pLyqYh3Wk8QpLo2Vb3Gh7Qk2Wq9Lo1Yp8UoKj3Ly6Tr,150',
    ].join('\n');

    const blob = new Blob([demoData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'airdrop-demo.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const parseCsvContent = (content: string): CsvData[] => {
    const lines = content.trim().split('\n');
    const data: CsvData[] = [];
    const startIndex = lines[0].toLowerCase().includes('address') ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split(',').map((part) => part.trim());
      if (parts.length >= 1) {
        const address = parts[0];
        let amt: number | undefined;

        try {
          new PublicKey(address);
          amt = parts.length > 1 ? parseFloat(parts[1]) : undefined;
          if (amt !== undefined && (isNaN(amt) || amt <= 0)) {
            console.warn(`Invalid amount for address ${address}: ${parts[1]}`);
            continue;
          }
          data.push({ address, amount: amt });
        } catch {
          console.warn(`Invalid address: ${address}`);
        }
      }
    }

    return data;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const parsedData = parseCsvContent(text);
        setCsvData(parsedData);

        if (parsedData.length > 0) {
          const hasAmounts = parsedData.some((row) => row.amount !== undefined);
          setUseCustomAmounts(hasAmounts);
          const addressList = parsedData.map((row) => row.address).join('\n');
          setWallets(addressList);
          setShowCsvPreview(true);
        } else {
          setStatus('❌ Invalid CSV file: No valid addresses found');
        }
      };
      reader.readAsText(file);
    }
  };

  const validateBalance = async (
    token: PublicKey,
    senderATA: PublicKey,
    totalAmountUi: number,
    decimals: number
  ) => {
    const solBalance = await connection.getBalance(publicKey!, 'confirmed');
    const totalFeeLamports = Math.round(calculateTotalFee() * LAMPORTS_PER_SOL);
    // Keep tiny buffer for tx fees
    if (solBalance < totalFeeLamports + Math.round(0.02 * LAMPORTS_PER_SOL)) {
      throw new Error('Insufficient SOL balance for fees');
    }

    // Ensure sender ATA exists
    const ataInfo = await connection.getAccountInfo(senderATA, 'confirmed');
    if (!ataInfo) {
      throw new Error('Sender associated token account does not exist for this mint.');
    }

    const tokenBalance = await connection.getTokenAccountBalance(senderATA, 'confirmed');
    const required = toBaseUnits(totalAmountUi, decimals);
    if (BigInt(tokenBalance.value.amount) < required) {
      throw new Error('Insufficient token balance for airdrop');
    }
  };

  const handleCancel = () => {
    abortController.current.abort();
    setIsProcessing(false);
    setStatus('❌ Airdrop cancelled. Partial results available.');
  };

  const handleAirdrop = async () => {
    abortController.current = new AbortController(); // reset abort controller

    if (!publicKey || !signTransaction) {
      setStatus('❌ Wallet not connected or does not support signing');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setResults([]);
    setFeePaid(false);

    try {
      if (!tokenAddress.trim()) {
        throw new Error('Token address is required');
      }

      let token: PublicKey;
      try {
        token = new PublicKey(tokenAddress);
      } catch {
        throw new Error('Invalid token address');
      }

      // Prepare recipients
      let recipients: { address: string; amount: number }[] = [];
      if (useCustomAmounts && csvData.length > 0) {
        recipients = csvData.map((row) => ({
          address: row.address,
          amount: row.amount || Number(amount),
        }));
      } else {
        const addresses = wallets
          .split('\n')
          .map((addr) => addr.trim())
          .filter(Boolean);

        if (addresses.length === 0) throw new Error('At least one recipient address is required');
        if (!amount || Number(amount) <= 0) throw new Error('Amount must be greater than 0');

        recipients = addresses.map((address) => ({
          address,
          amount: Number(amount),
        }));
      }

      if (recipients.length > MAX_RECIPIENTS) {
        throw new Error(`Too many recipients (max ${MAX_RECIPIENTS} recommended). Split into multiple airdrops.`);
      }

      // Validate all recipient addresses
      for (const r of recipients) new PublicKey(r.address);

      // Platform fee
      const totalFee = calculateTotalFee();
      const feeInLamports = Math.round(totalFee * LAMPORTS_PER_SOL);

      setStatus('🔍 Fetching token details…');
      const mintInfo = await connection.getTokenSupply(token, 'confirmed');
      const decimals = mintInfo.value.decimals;

      const senderATA = await getAssociatedTokenAddress(token, publicKey);
      const totalTokenAmountUi = recipients.reduce((sum, r) => sum + r.amount, 0);
      await validateBalance(token, senderATA, totalTokenAmountUi, decimals);

      setStatus('⏳ Checking recipient ATAs in batches…');

      // Collect all recipient ATAs
      const recipientATAs: PublicKey[] = await Promise.all(
        recipients.map((r) => getAssociatedTokenAddress(token, new PublicKey(r.address)))
      );

      // Batch ATA existence checks
      const ataExists: boolean[] = [];
      for (let i = 0; i < recipientATAs.length; i += ATA_BATCH_SIZE) {
        const chunk = recipientATAs.slice(i, i + ATA_BATCH_SIZE);
        const infos = await connection.getMultipleAccountsInfo(chunk, 'confirmed');
        infos.forEach((info) => ataExists.push(info !== null));
        // tiny spacing to be nice to RPC
        await sleep(120);
      }

      // Build instruction batches (do not prebuild txs; we build/sign per send)
      const instructionBatches: TransactionInstruction[][] = [];

      // 1) Fee tx (optional)
      if (feeInLamports > 0) {
        const feeIx: TransactionInstruction[] = [
          ComputeBudgetProgram.setComputeUnitPrice({ microLamports: PRIORITY_FEE_MICRO_LAMPORTS }),
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: PLATFORM_WALLET,
            lamports: feeInLamports,
          }),
        ];
        instructionBatches.push(feeIx);
      }

      // 2) Airdrop txs (batched)
      recipients.forEach((recipient, index) => {
        const batchIndex = Math.floor(index / BATCH_SIZE);
        const offset = feeInLamports > 0 ? 1 : 0;
        if (!instructionBatches[batchIndex + offset]) {
          instructionBatches[batchIndex + offset] = [
            ComputeBudgetProgram.setComputeUnitPrice({ microLamports: PRIORITY_FEE_MICRO_LAMPORTS }),
          ];
        }
        const ixs = instructionBatches[batchIndex + offset];

        const recipientPubkey = new PublicKey(recipient.address);
        const recipientATA = recipientATAs[index];
        const amountInBaseUnit = toBaseUnits(recipient.amount, decimals);

        if (!ataExists[index]) {
          ixs.push(
            createAssociatedTokenAccountInstruction(
              publicKey, // payer
              recipientATA,
              recipientPubkey,
              token
            )
          );
        }

        ixs.push(createTransferInstruction(senderATA, recipientATA, publicKey, amountInBaseUnit));
      });

      if (instructionBatches.length === 0) {
        throw new Error('No valid transactions to process');
      }

      const txResults: TransactionResult[] = [];

      // Helper to create, sign, send and confirm ONE tx (fresh blockhash each time)
      const sendOne = async (ixs: TransactionInstruction[]) => {
        // Build
        const tx = new Transaction().add(...ixs);
        tx.feePayer = publicKey!;

        // Fresh blockhash
        const bh: BlockhashWithExpiryBlockHeight = await connection.getLatestBlockhash('confirmed');
        tx.recentBlockhash = bh.blockhash;

        // Sign
        const signedTx = await signTransaction!(tx);

        // Send
        const sig = await connection.sendRawTransaction(signedTx.serialize(), {
          skipPreflight: false,
          maxRetries: 3,
        });

        // Confirm with same blockhash & lastValidBlockHeight
        const conf = await connection.confirmTransaction(
          { signature: sig, blockhash: bh.blockhash, lastValidBlockHeight: bh.lastValidBlockHeight },
          'confirmed'
        );

        if (conf.value.err) throw new Error(`Transaction failed: ${JSON.stringify(conf.value.err)}`);
        return sig;
      };

      for (let i = 0; i < instructionBatches.length; i++) {
        if (abortController.current.signal.aborted) throw new Error('Airdrop cancelled');

        const isFeeTx = i === 0 && feeInLamports > 0;
        const logicalBatchIndex = isFeeTx ? 0 : i - (feeInLamports > 0 ? 1 : 0) + 1;

        // Figure out which recipients this batch covers (for results)
        const batchRecipients = isFeeTx
          ? []
          : recipients.slice((logicalBatchIndex - 1) * BATCH_SIZE, logicalBatchIndex * BATCH_SIZE);

        let sentOk = false;
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
          if (abortController.current.signal.aborted) throw new Error('Airdrop cancelled');

          try {
            setStatus(
              `🚀 Sending ${isFeeTx ? 'fee transaction' : `batch ${logicalBatchIndex}`} (attempt ${attempt}/${MAX_RETRIES})…`
            );
            await sendOne(instructionBatches[i]);

            if (isFeeTx) setFeePaid(true);
            else batchRecipients.forEach((r) => txResults.push({ address: r.address, status: 'success' }));

            sentOk = true;
            break;
          } catch (err: any) {
            const delay = backoffDelay(attempt);
            console.error(`Tx ${i + 1} failed (attempt ${attempt}):`, err?.message || err);
            if (attempt < MAX_RETRIES) {
              setStatus(`⚠️ Retry ${attempt}/${MAX_RETRIES - 1} after ${delay} ms…`);
              await sleep(delay);
            } else {
              if (isFeeTx) {
                throw new Error('Fee transaction failed after maximum retries');
              } else {
                batchRecipients.forEach((r) =>
                  txResults.push({ address: r.address, status: 'failed', error: err?.message || 'Unknown error' })
                );
              }
            }
          }
        }

        setProgress(((i + 1) / instructionBatches.length) * 100);

        // Gentle delay between sends to avoid rate limiting
        if (!sentOk || i < instructionBatches.length - 1) {
          await sleep(SEND_DELAY_MS);
        }
      }

      setResults(txResults);
      setProgress(100);

      const successfulCount = txResults.filter((r) => r.status === 'success').length;
      const totalCount = recipients.length;

      if (txResults.length === 0 || successfulCount === 0) {
        setStatus(`❌ Airdrop failed. Fee: ${totalFee.toFixed(6)} SOL. Contact support for a refund.`);
      } else if (successfulCount === totalCount) {
        setStatus(`✅ Airdrop completed! ${successfulCount}/${totalCount} succeeded. Fee: ${totalFee.toFixed(6)} SOL`);
      } else {
        setStatus(
          `⚠️ Airdrop partially completed. ${successfulCount}/${totalCount} succeeded. Fee: ${totalFee.toFixed(
            6
          )} SOL`
        );
      }
    } catch (err: any) {
      if (err?.message === 'Airdrop cancelled') {
        setStatus('❌ Airdrop cancelled. Partial results available.');
      } else {
        console.error('Airdrop error:', err);
        setStatus(`❌ Error: ${err?.message || 'Unknown error'}${feePaid ? '. Contact support for a refund.' : ''}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResults = () => {
    const data = {
      timestamp: new Date().toISOString(),
      tokenAddress,
      useCustomAmounts,
      amount: useCustomAmounts ? 'varies' : amount,
      results,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `airdrop-results-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const recipientCount = useCustomAmounts ? csvData.length : wallets.split('\n').filter((addr) => addr.trim()).length;
  const totalAmount = useCustomAmounts
    ? csvData.reduce((sum, row) => sum + (row.amount || 0), 0)
    : recipientCount * Number(amount || 0);
  const totalFee = calculateTotalFee();

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-12 border border-white/10 max-w-md mx-auto">
            <Send className="h-16 w-16 text-purple-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Connect Wallet</h2>
            <p className="text-gray-300 mb-8">Please connect your wallet to start the airdrop</p>
            <p className="text-yellow-500 mb-4">Use your wallet extension to connect</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
  <SEO 
    title="Solana Token Airdrop Tool | Solsmint" 
    description="Easily airdrop your Solana SPL tokens to up to 500 addresses at once. Secure, reliable, and automated airdrop system with just 0.006 SOL per address." 
  />


    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 pt-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8 ">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center  space-x-3">
            
            <span className='text-lime-400 font-bold'>Token Airdrop</span>
          </h1>
          <p className="text-gray-300">Distribute tokens to multiple wallets</p>
        </div>





        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-black/40 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">Token Details That you want to Airdrop</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Token Address</label>
                  <input
                    type="text"
                    placeholder="Enter token address..."
                    className="w-full bg-black/20 border border-white/10 text-white px-4 py-3 rounded-lg"
                    value={tokenAddress}
                    onChange={(e) => setTokenAddress(e.target.value)}
                  />
                </div>
                {!useCustomAmounts && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Amount per Wallet</label>
                    <input
                      type="number"
                      placeholder="0.0"
                      className="w-full bg-black/20 border border-white/10 text-white px-4 py-3 rounded-lg"
                      value={amount}
                      min="0.000001"
                      step="any"
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">Recipients</h2>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <label className="bg-gradient-to-r from-lime-400 to-green-500 text-black font-bold px-4 py-2 rounded-lg cursor-pointer flex items-center space-x-2">
                    <Upload className="h-4 w-4" />
                    <span>Upload CSV</span>
                    <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
                  </label>
                  <button
                    onClick={generateDemoCSV}
                    className="bg-black/20 border border-white/10 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Demo CSV</span>
                  </button>
                </div>

                {showCsvPreview && csvData.length > 0 && (
                  <div className="bg-black/20 border border-white/10 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-3">CSV Preview ({csvData.length} addresses)</h4>
                    <div className="max-h-40 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left text-gray-300 p-2">Address</th>
                            <th className="text-left text-gray-300 p-2">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {csvData.slice(0, 5).map((row, index) => (
                            <tr key={index} className="border-b border-white/5">
                              <td className="text-white p-2 font-mono text-xs">
                                {row.address.slice(0, 8)}...{row.address.slice(-6)}
                              </td>
                              <td className="text-cyan-400 p-2">
                                {row.amount || (amount ? Number(amount) : 'N/A')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {!showCsvPreview && (
                  <textarea
                    rows={6}
                    placeholder="Enter addresses (one per line)"
                    className="w-full bg-black/20 border border-white/10 text-white px-4 py-3 rounded-lg font-mono text-sm"
                    value={wallets}
                    onChange={(e) => setWallets(e.target.value)}
                  />
                )}

                {recipientCount > 0 && (
                  <div className="text-sm text-gray-400">
                    📋 {recipientCount} addresses • Total tokens: {totalAmount.toLocaleString()}
                  </div>
                )}
              </div>
            </div>

            {recipientCount > 0 && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <h4 className="text-blue-300 font-medium mb-2 flex items-center space-x-2">
                  <Calculator className="h-5 w-5" />
                  <span>Fee Summary</span>
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-300">Addresses:</div>
                  <div className="text-white text-right">{recipientCount}</div>
                  <div className="text-gray-300">Fee per Address:</div>
                  <div className="text-cyan-400 text-right">{SOL_PER_ADDRESS.toFixed(6)} SOL</div>
                  <div className="text-gray-300 font-medium mt-2 pt-2 border-t border-white/10">Total Fee:</div>
                  <div className="text-yellow-400 font-medium text-right mt-2 pt-2 border-t border-white/10">
                    {totalFee.toFixed(6)} SOL
                  </div>
                </div>
              </div>
            )}
            

            <div className="bg-black/40 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <button
                className={`w-full py-4 rounded-lg font-medium flex items-center justify-center space-x-2 ${
                  !tokenAddress || !wallets || (!useCustomAmounts && !amount) || isProcessing
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:from-purple-700 hover:to-cyan-700'
                }`}
                onClick={handleAirdrop}
                disabled={!tokenAddress || !wallets || (!useCustomAmounts && !amount) || isProcessing}
              >
                {isProcessing ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Zap className="h-5 w-5" />
                )}
                <span>{isProcessing ? 'Processing... please not close the window' : `Execute Airdrop (Fee: ${totalFee.toFixed(6)} SOL)`}</span>
              </button>

              {isProcessing && (
                <button
                  className="w-full py-4 mt-4 rounded-lg font-medium flex items-center justify-center space-x-2 bg-red-600 text-white hover:bg-red-700"
                  onClick={handleCancel}
                >
                  <StopCircle className="h-5 w-5" />
                  <span>Cancel Airdrop</span>
                </button>
              )}

              {progress > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-300 mb-2">
                    <span>Progress</span>
                    <span>{progress.toFixed(0)}%</span>
                  </div>
                  <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {status && (
                <div
                  className={`mt-4 p-4 rounded-lg text-white ${
                    status.includes('✅')
                      ? 'bg-green-500/10 border border-green-500/20'
                      : status.includes('❌')
                      ? 'bg-red-500/10 border border-red-500/20'
                      : status.includes('⚠️')
                      ? 'bg-yellow-500/10 border border-yellow-500/20'
                      : 'bg-blue-500/10 border border-blue-500/20'
                  }`}
                >
                  <p className="text-sm">{status}</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-black/40 backdrop-blur-lg rounded-xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Addresses:</span>
                  <span className="text-white">{recipientCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount type:</span>
                  <span className="text-white">{useCustomAmounts ? 'Custom' : 'Fixed'}</span>
                </div>
                {!useCustomAmounts && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount per address:</span>
                    <span className="text-white">{amount || '0'}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Fee per address:</span>
                  <span className="text-cyan-400">{SOL_PER_ADDRESS.toFixed(6)} SOL</span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-3">
                  <span className="text-gray-300">Total tokens:</span>
                  <span className="text-cyan-400">{totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Total fee:</span>
                  <span className="text-yellow-400">{totalFee.toFixed(6)} SOL</span>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 md:p-5 text-sm bg-gradient-to-r from-lime-400 to-green-500 text-black font-bold">
  <div className="flex items-start gap-3">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 8a1 1 0 112 0v4a1 1 0 11-2 0V8zm1 6a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
    </svg>
    <div className="space-y-2">
      <h3 className="font-semibold">Airdrop Rules & Fees</h3>
      <ul className="list-disc pl-5 space-y-1">
        <li><span className="font-medium">Max 500 addresses</span> per batch.</li>
        <li>Transactions are sent in <span className="font-medium">sets of 15 addresses</span>. After each set, your wallet will ask you to approve again — this is for safety and delivery reliability.</li>
        <li>Service fee: <span className="font-semibold">0.006 SOL</span> per address (network fees  included).</li>
      </ul>
      <p className="text-xs text-blue-700/80">
        Tip: Remove duplicates before uploading to avoid extra charges.
      </p>
    </div>
  </div>
</div>


            {results.length > 0 && (
              <div className="bg-black/40 backdrop-blur-lg rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Results</h3>
                  <button
                    onClick={downloadResults}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                  >
                    <Download className="h-4 w-4" />
                    <span className="text-sm">Export</span>
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-green-400">Successful:</span>
                    <span className="text-white">{results.filter((r) => r.status === 'success').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-400">Failed:</span>
                    <span className="text-white">{results.filter((r) => r.status === 'failed').length}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-3">
                    <span className="text-gray-300">Success Rate:</span>
                    <span className="text-cyan-400 font-bold">
                      {(
                        (results.filter((r) => r.status === 'success').length / (results.length || 1)) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
