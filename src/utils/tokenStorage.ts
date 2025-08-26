export interface CreatedToken {
  mintAddress: string;
  name: string;
  symbol: string;
  decimals: number;
  supply: number;
  description?: string;
  imageUrl?: string;
  transactionSignature: string;
  createdAt: number;
  creator: string;
}

const STORAGE_KEY = 'solana_created_tokens';

export const saveCreatedToken = (token: CreatedToken): void => {
  try {
    const existingTokens = getCreatedTokens();
    const updatedTokens = [token, ...existingTokens];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTokens));
  } catch (error) {
    console.error('Failed to save token:', error);
  }
};

export const getCreatedTokens = (): CreatedToken[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to get tokens:', error);
    return [];
  }
};

export const getTokensByCreator = (creatorAddress: string): CreatedToken[] => {
  const allTokens = getCreatedTokens();
  return allTokens.filter(token => token.creator === creatorAddress);
};

export const deleteToken = (mintAddress: string): void => {
  try {
    const existingTokens = getCreatedTokens();
    const updatedTokens = existingTokens.filter(token => token.mintAddress !== mintAddress);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTokens));
  } catch (error) {
    console.error('Failed to delete token:', error);
  }
};