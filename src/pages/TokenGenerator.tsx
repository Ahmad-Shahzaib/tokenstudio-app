import React, { useState, useEffect } from 'react';
import { useWalletContext } from '../contexts/WalletContext';
import SEO from '../components/SEO';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, clusterApiUrl, Keypair } from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  createInitializeMintInstruction,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getMinimumBalanceForRentExemptMint,
  createSetAuthorityInstruction,
  AuthorityType
} from '@solana/spl-token';
import {
  createCreateMetadataAccountV3Instruction,
  PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID,
  DataV2
} from '@metaplex-foundation/mpl-token-metadata';
import { Coins, CheckCircle, AlertCircle, Loader, Wallet, Copy, ExternalLink, Upload, X, Image, Shield, Zap, Award, ChevronLeft, ChevronRight, Globe, MessageCircle, Twitter, Hash, Cpu, Activity, Layers } from 'lucide-react';
import { saveCreatedToken, CreatedToken } from '../utils/tokenStorage';
import { uploadImageToIPFS, uploadMetadataToIPFS, checkIPFSHealth } from '../utils/ipfs';

interface TokenFormData {
  name: string;
  symbol: string;
  decimals: number;
  supply: number;
  description: string;
  imageFile?: File;
  imageUrl?: string;
  website?: string;
  telegram?: string;
  twitter?: string;
  discord?: string;
  mintAuthority: boolean;
  freezeAuthority: boolean;
}

type FormStep = 'basic' | 'details' | 'social' | 'review' | 'creation';
type TransactionStep = 'idle' | 'payment' | 'upload' | 'creation' | 'metadata' | 'minting' | 'revoking' | 'complete' | 'error';

function convertIpfsUri(uri: string): string {
  if (uri.startsWith('ipfs://')) {
    return `https://ipfs.io/ipfs/${uri.split('ipfs://')[1]}`;
  }
  return uri;
}

export default function eTokenGenerator() {
  const { connected, publicKey, sendTransaction } = useWalletContext();
  const [currentStep, setCurrentStep] = useState<FormStep>('basic');
  const [formData, setFormData] = useState<TokenFormData>({
    name: '',
    symbol: '',
    decimals: 9,
    supply: 1000000,
    description: '',
    mintAuthority: true,
    freezeAuthority: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [transactionStep, setTransactionStep] = useState<TransactionStep>('idle');
  const [transactionSignature, setTransactionSignature] = useState<string>('');
  const [tokenMintAddress, setTokenMintAddress] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [ipfsHealth, setIpfsHealth] = useState<{ node: string; available: boolean }[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdTokenData, setCreatedTokenData] = useState<CreatedToken | null>(null);

  const PLATFORM_FEE = 0.07; // Platform fee
  const ADDITIONAL_FEE = 0.03; // Covers rent and transaction fees
  const PLATFORM_WALLET = new PublicKey('AkMRfs337Vy5i6fDw18EETTXZmm69p9V4ZLSKjXtbTRL');
  // real platfrom address
  // const PLATFORM_WALLET = new PublicKey('CWMFuRNeisP5EGbfVpzgfrQrYeaic3zvP6DpFonbTPRW');


  useEffect(() => {
    const loadStats = async () => {
      const health = await checkIPFSHealth();
      setIpfsHealth(health);
    };
    loadStats();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'decimals' || name === 'supply' ? parseInt(value) || 0 : value
    }));
  };

  const handleToggleChange = (field: 'mintAuthority' | 'freezeAuthority') => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size must be less than 10MB');
        return;
      }
      setFormData(prev => ({ ...prev, imageFile: file }));
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, imageFile: undefined, imageUrl: undefined }));
    setImagePreview('');
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getMetadataPDA = (mint: PublicKey): PublicKey => {
    const [metadataAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from('metadata'), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
      TOKEN_METADATA_PROGRAM_ID
    );
    return metadataAddress;
  };

  const validateStep = (step: FormStep): boolean => {
    switch (step) {
      case 'basic':
        return !!(formData.name && formData.symbol && formData.supply > 0);
      case 'details':
        return !!formData.imageFile; // Require image upload for details step

      default:
        return true;
    }
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) {
      if (currentStep === 'details' && !formData.imageFile) {
        setError('Please upload a token logo image before continuing.');
      } else {
        setError('Please fill in all required fields');
      }
      return;
    }
    setError('');
    const steps: FormStep[] = ['basic', 'details', 'social', 'review', 'creation'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) setCurrentStep(steps[currentIndex + 1]);
  };

  const prevStep = () => {
    const steps: FormStep[] = ['basic', 'details', 'social', 'review', 'creation'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) setCurrentStep(steps[currentIndex - 1]);
  };

  const createToken = async () => {
    if (!connected || !publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    if (!formData.name || !formData.symbol || formData.supply <= 0) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError('');
    setTransactionStep('payment');
    setCurrentStep('creation');

    try {
      // const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
      const connection = new Connection('https://mainnet.helius-rpc.com/?api-key=cf83b40d-47c1-4e6d-ac47-cdf35e878b6d', 'confirmed');

      const balance = await connection.getBalance(publicKey);
      const requiredBalance = (PLATFORM_FEE + ADDITIONAL_FEE) * LAMPORTS_PER_SOL;
      if (balance < requiredBalance) {
        throw new Error(`Insufficient balance. You need at least ${(PLATFORM_FEE + ADDITIONAL_FEE).toFixed(3)} SOL for fees and rent.`);
      }

      // Step 1: Charge platform fee
      const feeTransaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: PLATFORM_WALLET,
          lamports: PLATFORM_FEE * LAMPORTS_PER_SOL,
        })
      );

      const { blockhash } = await connection.getLatestBlockhash('confirmed');
      feeTransaction.recentBlockhash = blockhash;
      feeTransaction.feePayer = publicKey;

      const feeSignature = await sendTransaction(feeTransaction);
      await connection.confirmTransaction({
        signature: feeSignature,
        blockhash,
        lastValidBlockHeight: (await connection.getLatestBlockhash()).lastValidBlockHeight
      }, 'confirmed');

      setTransactionSignature(feeSignature);

      // Step 2: Upload image and metadata to IPFS if provided
      let imageUrl = '';
      let metadataUri = '';
      if (formData.imageFile || formData.website || formData.telegram || formData.twitter || formData.discord) {
        setTransactionStep('upload');
        setUploadProgress(0);
        if (formData.imageFile) {
          imageUrl = await uploadImageToIPFS(formData.imageFile, setUploadProgress);
          setFormData(prev => ({ ...prev, imageUrl }));
        }
        const metadataJson = {
          name: formData.name,
          symbol: formData.symbol,
          description: formData.description || `${formData.name} token created with TokenForge`,
          image: imageUrl || undefined,
          external_url: formData.website || undefined,
          attributes: [
            ...(formData.website ? [{ trait_type: 'Website', value: formData.website }] : []),
            ...(formData.telegram ? [{ trait_type: 'Telegram', value: formData.telegram }] : []),
            ...(formData.twitter ? [{ trait_type: 'Twitter', value: formData.twitter }] : []),
            ...(formData.discord ? [{ trait_type: 'Discord', value: formData.discord }] : []),
          ],
          properties: {
            files: imageUrl ? [{ uri: imageUrl, type: formData.imageFile?.type || 'image/png' }] : [],
            category: imageUrl ? 'image' : 'utility',
            creators: [{ address: publicKey.toString(), share: 100, verified: true }]
          },
          seller_fee_basis_points: 0
        };
        metadataUri = await uploadMetadataToIPFS(metadataJson);
      }

      // Step 3: Create token mint
      setTransactionStep('creation');
      const mintKeypair = Keypair.generate();
      const mintAddress = mintKeypair.publicKey;
      setTokenMintAddress(mintAddress.toString());
      const mintRent = await getMinimumBalanceForRentExemptMint(connection);
      const associatedTokenAddress = getAssociatedTokenAddressSync(mintAddress, publicKey);

      // Create single transaction for all token operations
      const tokenTransaction = new Transaction();

      // Add create account instruction
      tokenTransaction.add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mintAddress,
          space: MINT_SIZE,
          lamports: mintRent,
          programId: TOKEN_PROGRAM_ID,
        })
      );

      // Add initialize mint instruction (always set authority to publicKey for now)
      tokenTransaction.add(
        createInitializeMintInstruction(
          mintAddress,
          formData.decimals,
          publicKey, // Always set mint authority to creator initially
          publicKey  // Always set freeze authority to creator initially
        )
      );

      // Add create token account instruction
      tokenTransaction.add(
        createAssociatedTokenAccountInstruction(
          publicKey,
          associatedTokenAddress,
          publicKey,
          mintAddress
        )
      );

      // Add metadata creation if applicable
      if (metadataUri) {
        setTransactionStep('metadata');
        const metadataPDA = getMetadataPDA(mintAddress);
        const metadataData: DataV2 = {
          name: formData.name,
          symbol: formData.symbol,
          uri: metadataUri,
          sellerFeeBasisPoints: 0,
          creators: [{ address: publicKey, verified: true, share: 100 }],
          collection: null,
          uses: null,
        };
        tokenTransaction.add(
          createCreateMetadataAccountV3Instruction(
            {
              metadata: metadataPDA,
              mint: mintAddress,
              mintAuthority: publicKey,
              payer: publicKey,
              updateAuthority: publicKey,
            },
            {
              createMetadataAccountArgsV3: {
                data: metadataData,
                isMutable: true,
                collectionDetails: null,
              },
            }
          )
        );
      }

      // Add mint tokens instruction
      setTransactionStep('minting');
      const mintAmount = formData.supply * Math.pow(10, formData.decimals);
      tokenTransaction.add(
        createMintToInstruction(
          mintAddress,
          associatedTokenAddress,
          publicKey,
          mintAmount
        )
      );

      // Add revoke authority instructions if needed
      setTransactionStep('revoking');
      if (!formData.mintAuthority) {
        tokenTransaction.add(
          createSetAuthorityInstruction(
            mintAddress,
            publicKey,
            AuthorityType.MintTokens,
            null
          )
        );
      }

      if (!formData.freezeAuthority) {
        tokenTransaction.add(
          createSetAuthorityInstruction(
            mintAddress,
            publicKey,
            AuthorityType.FreezeAccount,
            null
          )
        );
      }

      // Sign and send the transaction
      const { blockhash: tokenBlockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
      tokenTransaction.recentBlockhash = tokenBlockhash;
      tokenTransaction.feePayer = publicKey;
      tokenTransaction.partialSign(mintKeypair);

      const tokenSignature = await sendTransaction(tokenTransaction);
      await connection.confirmTransaction({
        signature: tokenSignature,
        blockhash: tokenBlockhash,
        lastValidBlockHeight
      }, 'confirmed');

      setTransactionSignature(tokenSignature);

      // Save token to local storage
      const createdToken: CreatedToken = {
        mintAddress: mintAddress.toString(),
        name: formData.name,
        symbol: formData.symbol,
        decimals: formData.decimals,
        supply: formData.supply,
        description: formData.description,
        imageUrl: imageUrl || undefined,
        transactionSignature: tokenSignature,
        createdAt: Date.now(),
        creator: publicKey.toString(),
      };
      saveCreatedToken(createdToken);
      setTransactionStep('complete');
      setCreatedTokenData(createdToken);
      setShowSuccessModal(true);
    } catch (err: any) {
      setError(`Token creation failed: ${err.message || 'Unknown error'}`);
      setTransactionStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      symbol: '',
      decimals: 9,
      supply: 1000000,
      description: '',
      mintAuthority: true,
      freezeAuthority: true,
    });
    setCurrentStep('basic');
    setTransactionStep('idle');
    setTransactionSignature('');
    setTokenMintAddress('');
    setError('');
    setImagePreview('');
    setUploadProgress(0);
    setShowSuccessModal(false);
    setCreatedTokenData(null);
  };

  const getStepIcon = (step: string) => {
    switch (step) {
      case 'payment': return <Wallet className="w-6 h-6" />;
      case 'upload': return <Upload className="w-6 h-6" />;
      case 'creation': return <Cpu className="w-6 h-6" />;
      case 'metadata': return <Layers className="w-6 h-6" />;
      case 'minting': return <Coins className="w-6 h-6" />;
      case 'revoking': return <Shield className="w-6 h-6" />;
      case 'complete': return <CheckCircle className="w-6 h-6" />;
      default: return <div className="w-6 h-6 rounded-full border-2 border-gray-600"></div>;
    }
  };

  const getStepStatus = (step: string) => {
    const steps = ['payment', 'upload', 'creation', 'metadata', 'minting', 'revoking', 'complete'];
    const currentIndex = steps.indexOf(transactionStep);
    const stepIndex = steps.indexOf(step);
    if (transactionStep === 'error') return 'error';
    if (stepIndex < currentIndex) return 'complete';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  const getStepColor = (step: string) => {
    const colors = {
      payment: 'from-purple-500 to-purple-700',
      upload: 'from-orange-500 to-orange-700',
      creation: 'from-cyan-500 to-cyan-700',
      metadata: 'from-pink-500 to-pink-700',
      minting: 'from-green-500 to-green-700',
      revoking: 'from-yellow-500 to-yellow-700',
      complete: 'from-emerald-500 to-emerald-700'
    };
    return colors[step as keyof typeof colors] || 'from-gray-500 to-gray-700';
  };

  const pinataAvailable = ipfsHealth.find(node => node.node.includes('Pinata'))?.available || false;

  const renderStepContent = () => {
    switch (currentStep) {
      case 'basic':
        return (
          <div className="space-y-8">
            {/* Header Section with Cards Layout */}
            <div className="relative">
              {/* Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-indigo-600/20 rounded-3xl blur-xl"></div>

              <div className="relative bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm rounded-3xl border border-slate-700/50 p-8">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-r from-lime-400 via-green-400 to-emerald-400 rounded-2xl flex items-center justify-center shadow-xl">
                          <Cpu className="w-8 h-8 text-white" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-lime-400 via-green-400 to-emerald-400 rounded-full border-2 border-slate-900 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                        </div>
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-white mb-2">Token Configuration</h2>
                        <p className="text-slate-400">Set up your token's fundamental properties</p>
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator */}

                </div>
              </div>
            </div>

            {/* Form Fields in Card Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Token Name Card */}
              <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 hover:border-slate-600/50 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <label className="text-sm font-semibold text-slate-200">Token Name *</label>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your token name"
                    maxLength={32}
                    className="w-full px-4 py-4 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-transparent rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
                <div className="flex justify-between items-center mt-3 text-xs">
                  <span className="text-slate-500">Maximum 32 characters</span>
                  <span className={`font-mono ${formData.name.length > 28 ? 'text-amber-400' : 'text-slate-400'}`}>
                    {formData.name.length}/32
                  </span>
                </div>
              </div>

              {/* Token Symbol Card */}
              <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 hover:border-slate-600/50 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                  <label className="text-sm font-semibold text-slate-200">Token Symbol *</label>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    name="symbol"
                    value={formData.symbol}
                    onChange={handleInputChange}
                    placeholder="e.g., MAT"
                    maxLength={10}
                    className="w-full px-4 py-4 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
                <div className="flex justify-between items-center mt-3 text-xs">
                  <span className="text-slate-500">Maximum 10 characters</span>
                  <span className={`font-mono ${formData.symbol.length > 8 ? 'text-amber-400' : 'text-slate-400'}`}>
                    {formData.symbol.length}/10
                  </span>
                </div>
              </div>

              {/* Decimals Card */}
              <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 hover:border-slate-600/50 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <label className="text-sm font-semibold text-slate-200">Decimals</label>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    name="decimals"
                    value={formData.decimals}
                    onChange={handleInputChange}
                    min="0"
                    max="18"
                    className="w-full px-4 py-4 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
                <div className="mt-3">
                  <span className="text-xs text-slate-500">Standard is 9 decimals (like SOL)</span>
                </div>
              </div>

              {/* Total Supply Card */}
              <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 hover:border-slate-600/50 transition-all duration-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <label className="text-sm font-semibold text-slate-200">Total Supply *</label>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    name="supply"
                    value={formData.supply}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-4 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/50 transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-transparent rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
                <div className="mt-3">
                  <span className="text-xs text-slate-500">Total number of tokens to create</span>
                </div>
              </div>
            </div>

            {/* Token Authorities Section */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-pink-600/10 rounded-2xl blur-xl"></div>

              <div className="relative bg-slate-900/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-lime-400 via-green-400 to-emerald-400 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Token Authorities</h3>
                    <p className="text-slate-400 text-sm">Configure administrative permissions</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Mint Authority */}
                  <div className="bg-slate-800/40 rounded-xl border border-slate-700/50 p-6 hover:border-slate-600/50 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-white font-medium">Mint Authority</span>
                        </div>
                        <p className="text-xs text-slate-400">Allows creating additional tokens after deployment</p>
                      </div>
                      <button
                        onClick={() => handleToggleChange('mintAuthority')}
                        className={`relative w-12 h-6 rounded-full transition-all duration-300 ml-4 ${formData.mintAuthority
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                          : 'bg-slate-600'
                          }`}
                      >
                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${formData.mintAuthority ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                      </button>
                    </div>
                  </div>

                  {/* Freeze Authority */}
                  <div className="bg-slate-800/40 rounded-xl border border-slate-700/50 p-6 hover:border-slate-600/50 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-white font-medium">Freeze Authority</span>
                        </div>
                        <p className="text-xs text-slate-400">Allows freezing specific token accounts</p>
                      </div>
                      <button
                        onClick={() => handleToggleChange('freezeAuthority')}
                        className={`relative w-12 h-6 rounded-full transition-all duration-300 ml-4 ${formData.freezeAuthority
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                          : 'bg-slate-600'
                          }`}
                      >
                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${formData.freezeAuthority ? 'translate-x-6' : 'translate-x-0.5'
                          }`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'details':
        return (
          <div className="space-y-8">
            {/* Header Section with Enhanced Layout */}
            <div className="relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-orange-500/10 to-amber-500/10 rounded-3xl"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,146,60,0.1),transparent_70%)]"></div>

              <div className="relative bg-slate-900/70 backdrop-blur-sm rounded-3xl border border-slate-700/50 p-10">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="w-24 h-24 bg-gradient-to-r from-lime-400 via-green-400 to-emerald-400 rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-500/30">
                        <Image className="w-10 h-10 text-white" />
                      </div>
                      {/* Animated Ring */}
                      <div className="absolute inset-0 rounded-3xl border-2 border-orange-400/30 animate-pulse"></div>
                      <div className="absolute -inset-2 rounded-3xl border border-orange-300/20 animate-ping"></div>
                    </div>
                    <div>
                      <h2 className="text-4xl font-bold text-white mb-3">Visual Identity</h2>
                      <p className="text-slate-300 text-lg">Craft your token's visual presence</p>
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  <div className="flex items-center space-x-3 bg-orange-500/10 border border-orange-500/20 rounded-2xl px-6 py-3">
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                    <span className="text-orange-300 font-medium">Step 2 of 5</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Description Section - Takes 2 columns */}
              <div className="xl:col-span-2">
                <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 h-full">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">Token Description</h3>
                      <p className="text-slate-400 text-sm">Tell your story and vision</p>
                    </div>
                  </div>

                  <div className="relative">
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Share your token's mission, utility, and what makes it unique. This description will help potential holders understand your project's value..."
                      rows={8}
                      className="w-full px-5 py-4 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 transition-all duration-300 resize-none"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                    {/* Character Counter */}
                    <div className="absolute bottom-3 right-3 bg-slate-700/80 backdrop-blur-sm rounded-lg px-3 py-1">
                      <span className="text-xs text-slate-300 font-mono">{formData.description.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Logo Upload Section - Takes 1 column */}
              <div className="xl:col-span-1">
                <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 h-full">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <Image className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">Token Logo</h3>
                      <p className="text-slate-400 text-sm">Upload your brand image</p>
                    </div>
                  </div>

                  {!imagePreview ? (
                    <div className="relative group">
                      <input
                        required
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="block border-2 border-dashed border-slate-600 rounded-2xl p-8 text-center hover:border-purple-400 hover:bg-purple-400/5 transition-all duration-300 cursor-pointer group min-h-[280px] flex items-center justify-center"
                      >
                        <div className="flex flex-col items-center space-y-4">
                          <div className="relative">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <Upload className="w-8 h-8 text-white" />
                            </div>
                            {/* Upload Animation Rings */}
                            <div className="absolute inset-0 rounded-2xl border-2 border-purple-400/30 group-hover:animate-ping"></div>
                          </div>
                          <div>
                            <span className="text-lg text-white font-semibold block mb-2">Drop your logo here</span>
                            <p className="text-slate-400 text-sm mb-3">or click to browse files</p>
                            <div className="flex flex-wrap justify-center gap-2 text-xs">
                              <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">PNG</span>
                              <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">JPG</span>
                              <span className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">GIF</span>
                            </div>
                            <p className="text-slate-500 text-xs mt-3">Max 10MB • Stored on IPFS</p>
                          </div>
                        </div>
                      </label>
                    </div>
                  ) : (
                    <div className="relative group">
                      <div className="relative overflow-hidden rounded-2xl border border-slate-600/50">
                        <img
                          src={imagePreview}
                          alt="Token preview"
                          className="w-full h-72 object-cover"
                        />
                        {/* Overlay on Hover */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <span className="text-white font-medium">Preview</span>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full transition-colors shadow-lg flex items-center justify-center group/remove"
                      >
                        <X className="w-4 h-4 text-white group-hover/remove:scale-110 transition-transform" />
                      </button>

                      {/* Image Info */}
                      <div className="mt-4 p-3 bg-slate-800/50 rounded-xl border border-slate-600/30">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-300">Ready to upload</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-green-400">Valid format</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tips Section */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">Pro Tips</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Use a square logo (1:1 ratio) for best results across platforms</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>High contrast designs work better in small sizes</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Clear, compelling descriptions increase holder confidence</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span>Your visual identity represents your project's professionalism</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'social':
        return (
          <div className="space-y-10">
            {/* Header */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/40">
                <Globe className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
                Social Presence
              </h2>
              <p className="text-gray-400 text-base max-w-md mx-auto">
                Build trust and connect your community across platforms.
              </p>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Website */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-blue-500/40 transition">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-200 mb-3">
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span>Website URL</span>
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website || ""}
                  onChange={handleInputChange}
                  placeholder="https://yourproject.com"
                  className="w-full px-4 py-3 bg-transparent border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition"
                />
              </div>

              {/* Telegram */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-cyan-500/40 transition">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-200 mb-3">
                  <MessageCircle className="w-4 h-4 text-cyan-400" />
                  <span>Telegram</span>
                </label>
                <input
                  type="url"
                  name="telegram"
                  value={formData.telegram || ""}
                  onChange={handleInputChange}
                  placeholder="https://t.me/yourgroup"
                  className="w-full px-4 py-3 bg-transparent border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition"
                />
              </div>

              {/* Twitter */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-sky-500/40 transition">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-200 mb-3">
                  <Twitter className="w-4 h-4 text-sky-400" />
                  <span>Twitter/X</span>
                </label>
                <input
                  type="url"
                  name="twitter"
                  value={formData.twitter || ""}
                  onChange={handleInputChange}
                  placeholder="https://twitter.com/yourproject"
                  className="w-full px-4 py-3 bg-transparent border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 transition"
                />
              </div>

              {/* Discord */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-purple-500/40 transition">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-200 mb-3">
                  <Hash className="w-4 h-4 text-purple-400" />
                  <span>Discord</span>
                </label>
                <input
                  type="url"
                  name="discord"
                  value={formData.discord || ""}
                  onChange={handleInputChange}
                  placeholder="https://discord.gg/yourserver"
                  className="w-full px-4 py-3 bg-transparent border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition"
                />
              </div>
            </div>

            {/* Community Trust Box */}
            <div className="p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-indigo-500/10 backdrop-blur-md hover:shadow-xl hover:shadow-indigo-500/20 transition">
              <div className="flex items-center space-x-3 mb-3">
                <Shield className="w-6 h-6 text-indigo-400" />
                <h3 className="text-lg font-semibold text-white">Community Trust</h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Social links help establish credibility and allow your community to connect with your project across multiple platforms.
              </p>
            </div>
          </div>


        );

      case 'review':
        return (
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/30">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-4xl font-extrabold bg-gradient-to-r from-white via-indigo-200 to-pink-200 bg-clip-text text-transparent mb-4">
                Deployment Overview
              </h2>
              <p className="text-gray-400 text-lg">
                Double-check your details before finalizing deployment on blockchain.
              </p>
            </div>

            {/* Token Details */}
            <div className="bg-gradient-to-br from-gray-900/40 to-gray-800/40 rounded-3xl p-8 border border-gray-700/40 backdrop-blur-md">
              <div className="flex items-start space-x-6 mb-8">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt={formData.name}
                    className="w-24 h-24 rounded-2xl object-cover shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-2xl">
                      {formData.symbol.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-3xl font-bold text-white mb-2">
                    {formData.name}
                  </h3>
                  <p className="text-gray-400 text-lg mb-4">{formData.symbol}</p>
                  {formData.description && (
                    <p className="text-gray-300 leading-relaxed">
                      {formData.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Supply Info */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                  <div className="text-2xl font-bold text-white">
                    {formData.supply.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">Total Supply</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                  <div className="text-2xl font-bold text-white">
                    {formData.decimals}
                  </div>
                  <div className="text-sm text-gray-400">Decimals</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                  <div className="text-2xl font-bold text-indigo-400">
                    {formData.mintAuthority ? "Enabled" : "Disabled"}
                  </div>
                  <div className="text-sm text-gray-400">Mint Authority</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                  <div className="text-2xl font-bold text-indigo-400">
                    {formData.freezeAuthority ? "Enabled" : "Disabled"}
                  </div>
                  <div className="text-sm text-gray-400">Freeze Authority</div>
                </div>
              </div>

              {/* Social Links */}
              {(formData.website ||
                formData.telegram ||
                formData.twitter ||
                formData.discord) && (
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-white mb-4">
                      Connected Platforms
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {formData.website && (
                        <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                          <Globe className="w-5 h-5 text-blue-400" />
                          <span className="text-white text-sm truncate">
                            {formData.website}
                          </span>
                        </div>
                      )}
                      {formData.telegram && (
                        <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                          <MessageCircle className="w-5 h-5 text-cyan-400" />
                          <span className="text-white text-sm truncate">
                            {formData.telegram}
                          </span>
                        </div>
                      )}
                      {formData.twitter && (
                        <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                          <Twitter className="w-5 h-5 text-sky-400" />
                          <span className="text-white text-sm truncate">
                            {formData.twitter}
                          </span>
                        </div>
                      )}
                      {formData.discord && (
                        <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                          <Hash className="w-5 h-5 text-purple-400" />
                          <span className="text-white text-sm truncate">
                            {formData.discord}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
            </div>

            {/* Fee & IPFS Info */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
              {/* Platform Fee */}
              <div className=" bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-6 rounded-2xl border border-purple-500/20">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Coins className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Deployment Fees</h3>
                </div>
                <p className="text-gray-300 mb-4">
                  Required one-time cost to initialize your token.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Platform Fee:</span>
                  <span className="text-2xl font-bold text-purple-400">0.07 SOL</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-gray-400">Estimated Gas:</span>
                  <span className="text-lg font-semibold text-gray-300">~0.03 SOL</span>
                </div>
              </div>

              {/* IPFS Status */}

            </div>
          </div>

        );

      case 'creation':
        return (
          <div className="space-y-10">
            {/* Header Section */}
            <div className="text-center mb-12 relative">

              <h2 className="text-5xl font-extrabold bg-gradient-to-r from-white via-purple-300 to-cyan-300 bg-clip-text text-transparent mb-8 tracking-wide">
                Deploying Your Token
              </h2>
              <p className="text-gray-400 text-lg">Finalizing smart contract & blockchain setup...</p>
            </div>

            {/* Steps Section */}
            <div className="space-y-6">
              {[
                { step: 'payment', title: 'Processing Payment', desc: 'Confirming platform fee transaction', color: 'purple' },
                { step: 'upload', title: 'Decentralized Storage', desc: 'Uploading metadata securely to IPFS', color: 'orange' },
                { step: 'creation', title: 'Token Mint Creation', desc: 'Initializing token on Solana blockchain', color: 'cyan' },
                { step: 'metadata', title: 'Metadata Binding', desc: 'Attaching token metadata and assets', color: 'pink' },
                { step: 'minting', title: 'Supply Minting', desc: 'Minting initial supply into your wallet', color: 'green' },
                { step: 'revoking', title: 'Authority Revocation', desc: 'Disabling mint & freeze authorities', color: 'yellow' },
                { step: 'complete', title: 'Deployment Finished', desc: 'Token successfully launched', color: 'emerald' }
              ].map(({ step, title, desc, color }) => {
                const status = getStepStatus(step);
                const isActive = status === 'active';
                const isComplete = status === 'complete';
                const isError = status === 'error';

                return (
                  <div
                    key={step}
                    className={`relative overflow-hidden rounded-2xl border transition-all duration-500 group 
            ${isActive
                        ? `border-${color}-500/50 bg-gradient-to-r from-${color}-600/20 to-black/20 shadow-xl shadow-${color}-500/30`
                        : isComplete
                          ? 'border-green-500/40 bg-gradient-to-r from-green-600/20 to-black/20'
                          : isError
                            ? 'border-red-500/40 bg-gradient-to-r from-red-600/20 to-black/20'
                            : 'border-gray-700/50 bg-black/30'
                      }`}
                  >
                    <div className="flex items-center p-6 space-x-5">
                      {/* Icon */}


                      {/* Step Text */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
                        <p className="text-gray-400 text-sm">{desc}</p>

                        {step === 'upload' && isActive && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-orange-400 font-medium">Uploading to IPFS...</span>
                              <span className="text-xs text-orange-400">{uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-300 relative"
                                style={{ width: `${uploadProgress}%` }}
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Status */}
                      <div className="text-right">
                        {isComplete && (
                          <div className="text-green-400 text-sm font-medium">✓ Done</div>
                        )}
                        {isActive && (
                          <div className={`text-${color}-400 text-sm font-medium animate-pulse`}>
                            Processing...
                          </div>
                        )}
                        {status === 'pending' && (
                          <div className="text-gray-500 text-sm">Pending</div>
                        )}
                        {isError && (
                          <div className="text-red-400 text-sm font-medium">Failed</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Success Message */}
            {transactionStep === 'complete' && (
              <div className="bg-gradient-to-tr from-emerald-500/10 to-green-500/10 p-8 rounded-3xl border border-green-500/30 animate-glow">
                <div className="text-center">
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4 animate-bounce" />
                  <h3 className="text-3xl font-bold text-white mb-2">Token Deployed Successfully!</h3>
                  <p className="text-gray-300">Your token is now live and accessible on the Solana blockchain 🚀</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && transactionStep === 'error' && (
              <div className="bg-gradient-to-tr from-red-500/10 to-red-600/10 p-6 rounded-2xl border border-red-500/30">
                <div className="flex items-center space-x-4">
                  <AlertCircle className="w-9 h-9 text-red-400" />
                  <div>
                    <h3 className="text-xl font-bold text-red-400 mb-1">Transaction Failed</h3>
                    <p className="text-red-300">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

        );

      default:
        return null;
    }
  };

  const getStepNumber = (step: FormStep) => {
    const steps: FormStep[] = ['basic', 'details', 'social', 'review', 'creation'];
    return steps.indexOf(step) + 1;
  };

  const isStepComplete = (step: FormStep) => {
    const steps: FormStep[] = ['basic', 'details', 'social', 'review', 'creation'];
    const currentIndex = steps.indexOf(currentStep);
    const stepIndex = steps.indexOf(step);
    return stepIndex < currentIndex || (stepIndex === currentIndex && currentStep === 'creation' && transactionStep === 'complete');
  };

  const isStepActive = (step: FormStep) => currentStep === step;

  return (
    <>
      <SEO
        title="Solana Token Builder | TokenStudio"
        description="Create your own Solana SPL token in seconds. No coding required. Free and easy token creation on Solana blockchain."
      />

      <div className=" ">
        {/* Animated background */}


        <div className="relative pt-6 sm:pt-12 px-2 sm:px-4 lg:px-8">
          <div className=" mx-auto">
            {/* Progress Steps */}
            <div className="mb-10 sm:mb-16">
              {/* Modern Circular Progress Track */}
              <div className="relative max-w-5xl mx-auto px-0 sm:px-4 mb-8 overflow-x-auto overflow-y-hidden">
                <div className="flex items-center justify-between sm:justify-between gap-2 sm:gap-0 min-w-[400px] sm:min-w-0">
                  {(['basic', 'details', 'social', 'review', 'creation'] as FormStep[]).map((step, index) => (
                    <React.Fragment key={step}>
                      <div className="relative flex flex-col items-center group">
                        {/* Step Circle with Enhanced Design */}
                        <div
                          className={`relative flex items-center justify-center w-16 h-16 rounded-full border-3 transition-all duration-700 transform group-hover:scale-110 ${isStepComplete(step)
                            ? 'bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 border-emerald-400 shadow-2xl shadow-emerald-500/50'
                            : isStepActive(step)
                              ? 'bg-gradient-to-r from-lime-400 via-green-400 to-emerald-400 border-blue-400 shadow-2xl shadow-blue-500/50'
                              : 'border-slate-600 bg-slate-800/60 backdrop-blur-sm hover:border-slate-500 hover:bg-slate-700/60'
                            }`}
                        >
                          {/* Inner Shine Effect */}
                          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-60"></div>

                          {/* Step Content */}
                          {isStepComplete(step) ? (
                            <CheckCircle className="w-8 h-8 text-white drop-shadow-lg relative z-10" />
                          ) : (
                            <span className={`font-bold text-xl relative z-10 ${isStepActive(step) ? 'text-white' : 'text-slate-300'
                              }`}>
                              {getStepNumber(step)}
                            </span>
                          )}

                          {/* Active Pulse Ring */}
                          {isStepActive(step) && (
                            <>
                              <div className="absolute inset-0 rounded-full border-2 border-white/40 animate-ping"></div>
                              <div className="absolute inset-0 rounded-full border border-white/20 animate-pulse"></div>
                            </>
                          )}
                        </div>

                        {/* Floating Active Indicator */}
                        {isStepActive(step) && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-bounce shadow-lg border-2 border-white/20"></div>
                        )}

                        {/* Step Label */}
                        <span
                          className={`mt-4 font-semibold text-sm text-center transition-all duration-300 ${isStepActive(step)
                            ? 'text-blue-300 scale-110'
                            : isStepComplete(step)
                              ? 'text-emerald-300'
                              : 'text-slate-400'
                            }`}
                        >
                          {[
                            { step: 'basic', label: 'Configuration' },
                            { step: 'details', label: 'Visual Identity' },
                            { step: 'social', label: 'Social Links' },
                            { step: 'review', label: 'Review' },
                            { step: 'creation', label: 'Deployment' }
                          ].find(item => item.step === step)?.label}
                        </span>
                      </div>

                      {/* Enhanced Connecting Line */}
                      {index < 4 && (
                        <div className="relative flex-1 mx-4 h-1">
                          {/* Background Line */}
                          <div className="absolute inset-0 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 rounded-full"></div>
                          {/* Progress Line */}
                          <div
                            className={`absolute inset-0 rounded-full transition-all duration-1000 ease-out ${isStepComplete(step)
                              ? 'bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 shadow-lg shadow-emerald-500/30'
                              : isStepActive(step)
                                ? 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg shadow-blue-500/30'
                                : 'bg-slate-600'
                              }`}
                            style={{
                              width: isStepComplete(step) ? '100%' : isStepActive(step) ? '50%' : '0%'
                            }}
                          ></div>
                          {/* Animated Dots for Active */}
                          {isStepActive(step) && (
                            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white rounded-full animate-ping"></div>
                          )}
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
              {/* Enhanced Status Bar */}
              <div className="max-w-4xl mx-auto">
                <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-gradient-to-r from-lime-400 via-green-400 to-emerald-400  rounded-full animate-pulse"></div>
                      <span className="text-slate-200 font-medium">Progress Overview</span>
                    </div>
                    <span className="text-slate-300 text-sm font-mono">
                      {(['basic', 'details', 'social', 'review', 'creation'] as FormStep[]).filter(step => isStepComplete(step)).length}/5 Complete
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-600 rounded-full transition-all duration-1500 ease-out relative"
                      style={{
                        width: `${((['basic', 'details', 'social', 'review', 'creation'] as FormStep[]).filter(step => isStepComplete(step)).length / 5) * 100}%`
                      }}
                    >
                      {/* Shimmer Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                    </div>
                  </div>

                  {/* Mini Steps Indicator */}
                  <div className="flex justify-center space-x-2 mt-4">
                    {(['basic', 'details', 'social', 'review', 'creation'] as FormStep[]).map((step) => (
                      <div
                        key={step}
                        className={`w-2 h-2 rounded-full transition-all duration-500 ${isStepComplete(step)
                          ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50'
                          : isStepActive(step)
                            ? 'bg-blue-400 animate-pulse shadow-lg shadow-blue-400/50'
                            : 'bg-slate-600'
                          }`}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>


            {/* Main Content */}
            <div className="relative">
              <div className={`transition-all duration-500 ${!connected ? 'blur-sm' : ''}`}>
                <div className="bg-black/40 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-4 sm:p-8 lg:p-12 mb-8 shadow-2xl">
                  {renderStepContent()}

                  {error && transactionStep !== 'error' && (
                    <div className="mt-8 p-6 bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/20 rounded-2xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                          <AlertCircle className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                          <h3 className="text-red-400 font-semibold mb-1">Error</h3>
                          <p className="text-red-300 text-sm">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  {currentStep !== 'creation' && (
                    <div className="flex flex-col sm:flex-row justify-between items-center mt-8 sm:mt-12 gap-4 sm:gap-0">
                      <button
                        onClick={prevStep}
                        disabled={currentStep === 'basic'}
                        className="w-full sm:w-auto flex items-center space-x-3 px-6 sm:px-8 py-3 sm:py-4 bg-gray-800/50 hover:bg-gray-700/50 disabled:bg-gray-800/20 disabled:cursor-not-allowed text-white font-semibold rounded-2xl transition-all duration-300 border border-gray-700/50 hover:border-gray-600/50"
                      >
                        <ChevronLeft className="w-5 h-5" />
                        <span>Previous</span>
                      </button>

                      {currentStep === 'review' ? (
                        <button
                          onClick={createToken}
                          disabled={isLoading || !pinataAvailable}
                          className="flex items-center space-x-3 px-12 py-4 bg-gradient-to-r from-purple-600 via-cyan-600 to-green-600 hover:from-purple-700 hover:via-cyan-700 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          {isLoading ? (
                            <>
                              <Loader className="w-6 h-6 animate-spin" />
                              <span>Deploying Token...</span>
                            </>
                          ) : !pinataAvailable ? (
                            <>
                              <AlertCircle className="w-6 h-6" />
                              <span>IPFS Unavailable</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-6 h-6" />
                              {/* <span>Deploy Token ({PLATFORM_FEE} SOL)</span> */}
                              <span>Deploy Token ({PLATFORM_FEE + 0.03} SOL)</span>

                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={nextStep}
                          className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-[#10B981] to-[#A3E635] text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        >
                          <span>Continue</span>
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {/* Wallet Connection Overlay */}
              {!connected && (
                <div className="absolute inset-0 flex items-center justify-center ">
                  <div
                    style={{ background: "transparent", backdropFilter: 'blur(12px)' }}
                    className="w-full max-w-md p-6 sm:p-12 border border-gray-700/50 rounded-3xl text-center shadow-2xl"
                  >
                    <div className="w-24 h-24 bg-gradient-to-r from-[#10B981] to-[#A3E635] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg">
                      <Wallet className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">Connect Wallet</h2>
                    <p className="text-gray-400 mb-8 max-w-md">Connect your Solana wallet to start creating professional tokens on the blockchain.</p>
                    <div className="px-4 py-3 bg-gray-800/50 rounded-xl text-gray-400">
                      <p className="text-sm">Supported wallets: Phantom, Solflare, Torus</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Success Modal */}
            {showSuccessModal && createdTokenData && (
              <div
                style={{ background: "transparent", backdropFilter: 'blur(12px)' }}
                className="fixed inset-0  flex items-center justify-center z-50 p-2 sm:p-4">
                <div className=" border border-gray-700/50 rounded-3xl p-4 sm:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                  style={{ background: "transparent", backdropFilter: 'blur(12px)' }}
                >

                  <div className="text-center mb-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-500/25">
                      <CheckCircle className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent mb-4">
                      🎉 Token Deployed Successfully!
                    </h2>
                    <p className="text-gray-400 text-lg">Your token is now live on Solana Mainnet</p>
                  </div>

                  <div className="bg-black/40 rounded-2xl p-6 mb-8 border border-gray-700/50">
                    <div className="flex items-start space-x-6 mb-6">
                      {createdTokenData.imageUrl ? (
                        // <img src={createdTokenData.imageUrl} alt={createdTokenData.name} className="w-20 h-20 rounded-2xl object-cover shadow-lg" />
                        <img
                          src={convertIpfsUri(createdTokenData.imageUrl)}
                          alt={createdTokenData.name}
                          className="w-20 h-20 rounded-2xl object-cover shadow-lg"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-2xl">{createdTokenData.symbol.charAt(0)}</span>
                        </div>
                      )}
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">{createdTokenData.name}</h3>
                        <p className="text-gray-400 text-lg">{createdTokenData.symbol}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                          <span>{createdTokenData.supply.toLocaleString()} tokens</span>
                          <span>•</span>
                          <span>{createdTokenData.decimals} decimals</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="bg-black/40 rounded-2xl p-4 border border-gray-700/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 font-medium">Mint Address:</span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => copyToClipboard(createdTokenData.mintAddress, 'modal-mint')}
                            className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                            title="Copy address"
                          >
                            <Copy className="w-4 h-4 text-gray-400" />
                          </button>
                          <a
                            // href={`https://explorer.solana.com/address/${createdTokenData.mintAddress}?cluster=devnet`}
                            href={`https://explorer.solana.com/address/${createdTokenData.mintAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                            title="View on Solana Explorer"
                          >
                            <ExternalLink className="w-4 h-4 text-gray-400" />
                          </a>
                        </div>
                      </div>
                      <div className="font-mono text-sm text-white break-all bg-gray-800/50 p-3 rounded-lg">
                        {createdTokenData.mintAddress}
                      </div>
                      {copied === 'modal-mint' && <span className="text-green-400 text-xs">Copied!</span>}
                    </div>

                    <div className="bg-black/40 rounded-2xl p-4 border border-gray-700/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 font-medium">Transaction:</span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => copyToClipboard(createdTokenData.transactionSignature, 'modal-tx')}
                            className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                            title="Copy signature"
                          >
                            <Copy className="w-4 h-4 text-gray-400" />
                          </button>
                          <a
                            // href={`https://explorer.solana.com/tx/${createdTokenData.transactionSignature}?cluster=devnet`}
                            href={`https://explorer.solana.com/tx/${createdTokenData.transactionSignature}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                            title="View on Solana Explorer"
                          >
                            <ExternalLink className="w-4 h-4 text-gray-400" />
                          </a>
                        </div>
                      </div>
                      <div className="font-mono text-sm text-white break-all bg-gray-800/50 p-3 rounded-lg">
                        {createdTokenData.transactionSignature}
                      </div>
                      {copied === 'modal-tx' && <span className="text-green-400 text-xs">Copied!</span>}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <button
                      className="w-full sm:flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl"
                      onClick={resetForm}
                    >
                      Create Another Token
                    </button>
                    <button
                      className="w-full sm:flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-gray-800/50 hover:bg-gray-700/50 text-white font-semibold rounded-2xl transition-all duration-300 border border-gray-700/50"
                      onClick={() => setShowSuccessModal(false)}
                    >
                      Close
                    </button>
                  </div>


                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>

  );
}