// Production IPFS utilities using Pinata with your credentials
// Updated to use IPFS URIs instead of gateway URLs per Pinata's recommendation

interface PinataConfig {
  apiKey: string;
  secretKey: string;
  jwt: string;
  gateway: string;
}

// Your Pinata configuration
const PINATA_CONFIG: PinataConfig = {
  apiKey: '5b6804c8d8da3a1196e7',
  secretKey: '115d3032fa676c4212c63a5e8d599e9fc502a845e1776a9af2510b1da516f2c6',
  jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIxOTc4MmIyMC1lZDNmLTRiMjQtOWEzNi00NTI2OGJiNmI0ZjciLCJlbWFpbCI6InRva2Vuc3R1ZGlvNkBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiNWI2ODA0YzhkOGRhM2ExMTk2ZTciLCJzY29wZWRLZXlTZWNyZXQiOiIxMTVkMzAzMmZhNjc2YzQyMTJjNjNhNWU4ZDU5OWU5ZmM1MDJhODQ1ZTE3NzZhOWFmMjUxMGIxZGE1MTZmMmM2IiwiZXhwIjoxNzg3NzMwMjU2fQ.NgQbnpY77hI-6ZiVReP3l5Xpgz0AJvi8z-6_e_8crD4',
  gateway: 'https://azure-adorable-impala-527.mypinata.cloud'
};

// Fallback IPFS gateways for redundancy
const FALLBACK_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://gateway.ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://dweb.link/ipfs/'
];

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 60000 // Increased timeout for larger files
};

// Pinata API endpoints
const PINATA_ENDPOINTS = {
  pinFile: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
  pinJSON: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
  testAuth: 'https://api.pinata.cloud/data/testAuthentication'
};

// Storage for uploaded content (for offline access)
const IPFS_STORAGE_KEY = 'ipfs_uploaded_content';

interface StoredIPFSContent {
  hash: string;
  url: string;
  data: string;
  timestamp: number;
}

// Store content locally for offline access
function storeIPFSContent(hash: string, url: string, data: string): void {
  try {
    const stored = localStorage.getItem(IPFS_STORAGE_KEY);
    const content: StoredIPFSContent[] = stored ? JSON.parse(stored) : [];

    // Remove old entry if exists
    const filtered = content.filter(item => item.hash !== hash);

    // Add new entry
    filtered.push({
      hash,
      url,
      data,
      timestamp: Date.now()
    });

    // Keep only last 100 items to prevent storage bloat
    const limited = filtered.slice(-100);

    localStorage.setItem(IPFS_STORAGE_KEY, JSON.stringify(limited));
  } catch (error) {
    console.warn('Failed to store IPFS content locally:', error);
  }
}

// Retrieve stored content
function getStoredIPFSContent(hash: string): string | null {
  try {
    const stored = localStorage.getItem(IPFS_STORAGE_KEY);
    if (!stored) return null;

    const content: StoredIPFSContent[] = JSON.parse(stored);
    const item = content.find(item => item.hash === hash);

    return item ? item.data : null;
  } catch (error) {
    console.warn('Failed to retrieve stored IPFS content:', error);
    return null;
  }
}

// Test Pinata authentication
async function testPinataAuth(): Promise<boolean> {
  try {
    const response = await fetch(PINATA_ENDPOINTS.testAuth, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PINATA_CONFIG.jwt}`,
        'Content-Type': 'application/json'
      }
    });

    return response.ok;
  } catch (error) {
    console.error('Pinata auth test failed:', error);
    return false;
  }
}

// Upload file to Pinata with retry mechanism
async function uploadFileToPinata(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  // Add metadata
  const metadata = JSON.stringify({
    name: file.name,
    keyvalues: {
      uploadedBy: 'TokenForge',
      timestamp: new Date().toISOString(),
      fileType: file.type,
      fileSize: file.size.toString()
    }
  });
  formData.append('pinataMetadata', metadata);

  // Add options
  const options = JSON.stringify({
    cidVersion: 1,
    customPinPolicy: {
      regions: [
        { id: 'FRA1', desiredReplicationCount: 1 },
        { id: 'NYC1', desiredReplicationCount: 1 }
      ]
    }
  });
  formData.append('pinataOptions', options);

  let attempt = 0;
  while (attempt < RETRY_CONFIG.maxRetries) {
    try {
      if (onProgress) onProgress(20 + (attempt * 20));

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), RETRY_CONFIG.timeout);

      const response = await fetch(PINATA_ENDPOINTS.pinFile, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PINATA_CONFIG.jwt}`
        },
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Pinata upload failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

      if (!result.IpfsHash) {
        throw new Error('Invalid response from Pinata: no IPFS hash returned');
      }

      if (onProgress) onProgress(80);

      // Verify upload by checking if it's accessible
      const verifyUrl = `${PINATA_CONFIG.gateway}/ipfs/${result.IpfsHash}`;
      try {
        const verifyController = new AbortController();
        const verifyTimeoutId = setTimeout(() => verifyController.abort(), 10000);

        const verifyResponse = await fetch(verifyUrl, {
          method: 'HEAD',
          signal: verifyController.signal
        });

        clearTimeout(verifyTimeoutId);

        if (!verifyResponse.ok) {
          throw new Error('Upload verification failed');
        }
      } catch (verifyError) {
        console.warn('Could not verify upload immediately, but proceeding:', verifyError);
      }

      if (onProgress) onProgress(100);

      console.log(`Successfully uploaded to Pinata: ${result.IpfsHash}`);
      return result.IpfsHash;

    } catch (error) {
      attempt++;
      console.warn(`Upload attempt ${attempt} failed:`, error);

      if (attempt >= RETRY_CONFIG.maxRetries) {
        throw new Error(`Failed to upload after ${RETRY_CONFIG.maxRetries} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_CONFIG.retryDelay * attempt));
    }
  }

  throw new Error('Upload failed after all retry attempts');
}

// Upload JSON to Pinata
async function uploadJSONToPinata(data: object, name: string): Promise<string> {
  const body = {
    pinataContent: data,
    pinataMetadata: {
      name: name,
      keyvalues: {
        uploadedBy: 'TokenForge',
        timestamp: new Date().toISOString(),
        type: 'metadata'
      }
    },
    pinataOptions: {
      cidVersion: 1,
      customPinPolicy: {
        regions: [
          { id: 'FRA1', desiredReplicationCount: 1 },
          { id: 'NYC1', desiredReplicationCount: 1 }
        ]
      }
    }
  };

  let attempt = 0;
  while (attempt < RETRY_CONFIG.maxRetries) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), RETRY_CONFIG.timeout);

      const response = await fetch(PINATA_ENDPOINTS.pinJSON, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PINATA_CONFIG.jwt}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Pinata JSON upload failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

      if (!result.IpfsHash) {
        throw new Error('Invalid response from Pinata: no IPFS hash returned');
      }

      console.log(`Successfully uploaded JSON to Pinata: ${result.IpfsHash}`);
      return result.IpfsHash;

    } catch (error) {
      attempt++;
      console.warn(`JSON upload attempt ${attempt} failed:`, error);

      if (attempt >= RETRY_CONFIG.maxRetries) {
        throw new Error(`Failed to upload JSON after ${RETRY_CONFIG.maxRetries} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_CONFIG.retryDelay * attempt));
    }
  }

  throw new Error('JSON upload failed after all retry attempts');
}

// Main image upload function
export const uploadImageToIPFS = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    // Validate file
    if (!file.type.startsWith('image/')) {
      throw new Error('Please select a valid image file');
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new Error('Image size must be less than 10MB');
    }

    if (onProgress) onProgress(5);

    // Test authentication first
    const authValid = await testPinataAuth();
    if (!authValid) {
      throw new Error('Pinata authentication failed. Please check your credentials.');
    }

    if (onProgress) onProgress(10);

    // Upload to Pinata
    const ipfsHash = await uploadFileToPinata(file, (progress) => {
      if (onProgress) onProgress(10 + (progress * 0.8)); // Scale to 10-90%
    });

    if (onProgress) onProgress(95);

    // Return IPFS URI instead of gateway URL
    const ipfsUri = `ipfs://${ipfsHash}`;

    // Store image data locally for offline access
    try {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          storeIPFSContent(ipfsHash, ipfsUri, reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.warn('Failed to store image locally:', error);
    }

    if (onProgress) onProgress(100);

    return ipfsUri;

  } catch (error) {
    console.error('IPFS image upload failed:', error);
    throw new Error(`Failed to upload image to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Upload metadata to IPFS
export const uploadMetadataToIPFS = async (
  metadata: object
): Promise<string> => {
  try {
    // Test authentication first
    const authValid = await testPinataAuth();
    if (!authValid) {
      throw new Error('Pinata authentication failed. Please check your credentials.');
    }

    // Upload JSON to Pinata
    const ipfsHash = await uploadJSONToPinata(metadata, 'token-metadata.json');

    // Return IPFS URI instead of gateway URL
    const ipfsUri = `ipfs://${ipfsHash}`;

    // Store metadata locally
    try {
      storeIPFSContent(ipfsHash, ipfsUri, JSON.stringify(metadata, null, 2));
    } catch (error) {
      console.warn('Failed to store metadata locally:', error);
    }

    return ipfsUri;

  } catch (error) {
    console.error('IPFS metadata upload failed:', error);
    throw new Error(`Failed to upload metadata to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Retrieve content from IPFS with fallback gateways
export const getIPFSContent = async (ipfsUrl: string): Promise<string | null> => {
  try {
    // Extract CID from both gateway URLs and ipfs:// URIs
    let hash: string | null = null;

    if (ipfsUrl.startsWith('ipfs://')) {
      hash = ipfsUrl.substring(7); // Remove 'ipfs://' prefix
    } else {
      // Extract from URL path
      const match = ipfsUrl.match(/\/ipfs\/([^/?]+)/);
      hash = match ? match[1] : null;
    }

    if (!hash) {
      return null;
    }

    // Try stored content first
    const storedContent = getStoredIPFSContent(hash);
    if (storedContent) {
      return storedContent;
    }

    // Try your dedicated gateway first
    const gateways = [PINATA_CONFIG.gateway + '/ipfs/', ...FALLBACK_GATEWAYS];

    for (const gateway of gateways) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(`${gateway}${hash}`, {
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const content = await response.text();
          // Store for future offline access
          storeIPFSContent(hash, ipfsUrl, content);
          return content;
        }
      } catch (error) {
        console.warn(`Failed to fetch from ${gateway}:`, error);
        continue;
      }
    }

    return null;
  } catch (error) {
    console.error('Failed to retrieve IPFS content:', error);
    return null;
  }
};

// Get stored image data (for offline access and dashboard display)
export const getStoredImageData = (ipfsUrl: string): string | null => {
  try {
    // Extract CID from both gateway URLs and ipfs:// URIs
    let hash: string | null = null;

    if (ipfsUrl.startsWith('ipfs://')) {
      hash = ipfsUrl.substring(7); // Remove 'ipfs://' prefix
    } else {
      // Extract from URL path
      const match = ipfsUrl.match(/\/ipfs\/([^/?]+)/);
      hash = match ? match[1] : null;
    }

    if (!hash) return ipfsUrl; // Return original URL as fallback

    const storedContent = getStoredIPFSContent(hash);
    if (storedContent && storedContent.startsWith('data:')) {
      return storedContent; // Return base64 data URL
    }

    return ipfsUrl; // Return original IPFS URL
  } catch (error) {
    console.warn('Failed to get stored image data:', error);
    return ipfsUrl;
  }
};

// Get stored metadata
export const getStoredMetadata = async (ipfsUrl: string): Promise<object | null> => {
  try {
    const content = await getIPFSContent(ipfsUrl);
    if (content) {
      return JSON.parse(content);
    }
    return null;
  } catch (error) {
    console.error('Failed to parse metadata:', error);
    return null;
  }
};

// Health check for Pinata service
export const checkIPFSHealth = async (): Promise<{ node: string; available: boolean }[]> => {
  const results = [];

  // Test Pinata authentication
  try {
    const authValid = await testPinataAuth();
    results.push({
      node: 'Pinata (Your Account)',
      available: authValid
    });
  } catch {
    results.push({
      node: 'Pinata (Your Account)',
      available: false
    });
  }

  // Test your dedicated gateway
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(PINATA_CONFIG.gateway, {
      method: 'HEAD',
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    results.push({
      node: 'Your Pinata Gateway',
      available: response.ok
    });
  } catch {
    results.push({
      node: 'Your Pinata Gateway',
      available: false
    });
  }

  // Test fallback gateways
  for (const gateway of FALLBACK_GATEWAYS.slice(0, 2)) { // Test first 2 fallbacks
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(gateway.replace('/ipfs/', ''), {
        method: 'HEAD',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      results.push({
        node: `Fallback (${new URL(gateway).hostname})`,
        available: response.ok
      });
    } catch {
      results.push({
        node: `Fallback (${new URL(gateway).hostname})`,
        available: false
      });
    }
  }

  return results;
};

// Clear stored IPFS content (utility function)
export const clearStoredIPFSContent = (): void => {
  try {
    localStorage.removeItem(IPFS_STORAGE_KEY);
    console.log('Cleared stored IPFS content');
  } catch (error) {
    console.warn('Failed to clear stored IPFS content:', error);
  }
};

// Get storage usage statistics
export const getIPFSStorageStats = (): { count: number; size: string } => {
  try {
    const stored = localStorage.getItem(IPFS_STORAGE_KEY);
    if (!stored) return { count: 0, size: '0 KB' };

    const content: StoredIPFSContent[] = JSON.parse(stored);
    const sizeBytes = new Blob([stored]).size;
    const sizeKB = Math.round(sizeBytes / 1024);

    return {
      count: content.length,
      size: sizeKB > 1024 ? `${Math.round(sizeKB / 1024)} MB` : `${sizeKB} KB`
    };
  } catch (error) {
    console.warn('Failed to get storage stats:', error);
    return { count: 0, size: '0 KB' };
  }
};