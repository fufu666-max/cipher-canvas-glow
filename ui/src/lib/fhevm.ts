// FHEVM SDK utilities for frontend
import { ethers } from 'ethers';
import { JsonRpcProvider } from 'ethers';

// Import @zama-fhe/relayer-sdk - use dynamic import to avoid issues
// For localhost, we use @fhevm/mock-utils instead
let createInstance: any = null;
let initSDK: any = null;
let SepoliaConfig: any = null;
type FhevmInstance = any;

// Import @fhevm/mock-utils for localhost mock FHEVM
let MockFhevmInstance: any = null;

export interface EncryptedInput {
  handles: string[];
  inputProof: string;
}

let fhevmInstance: FhevmInstance | null = null;
let isSDKInitialized = false;
let isMockInstance = false;
let lastChainId: number | null = null; // Track the chainId used to create fhevmInstance

/**
 * Initialize FHEVM instance
 * Local network (31337): Uses @fhevm/mock-utils + Hardhat plugin
 * Sepolia (11155111): Uses @zama-fhe/relayer-sdk
 */
export async function initializeFHEVM(chainId?: number): Promise<FhevmInstance> {
  // Check window.ethereum
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    throw new Error('window.ethereum is not available. Please install MetaMask or another Web3 wallet.');
  }

  // Get chainId first
  let currentChainId = chainId;
  if (!currentChainId) {
    try {
      const chainIdHex = await (window as any).ethereum.request({ method: 'eth_chainId' });
      currentChainId = parseInt(chainIdHex, 16);
    } catch (error) {
      console.error('[FHEVM] Failed to get chainId:', error);
      currentChainId = 31337; // Default to localhost
    }
  }

  console.log('[FHEVM] Current chain ID:', currentChainId);

  // If fhevmInstance exists but chainId changed, reset it
  if (fhevmInstance && lastChainId !== null && lastChainId !== currentChainId) {
    console.log(`[FHEVM] Chain ID changed from ${lastChainId} to ${currentChainId}. Resetting FHEVM instance...`);
    fhevmInstance = null;
    lastChainId = null;
    // Reset SDK initialization flag if switching from Sepolia
    if (lastChainId === 11155111) {
      isSDKInitialized = false;
    }
  }

  if (!fhevmInstance) {

    // Configure FHEVM instance
    let config: any;
    
    // Local network: Use Mock FHEVM
    if (currentChainId === 31337) {
      console.log('[FHEVM] Using Mock FHEVM for localhost...');
      
      try {
        const localhostRpcUrl = 'http://localhost:8545';
        const provider = new JsonRpcProvider(localhostRpcUrl);
        
        // Fetch FHEVM metadata from Hardhat node
        const metadata = await provider.send('fhevm_relayer_metadata', []);
        
        if (metadata && metadata.ACLAddress && metadata.InputVerifierAddress && metadata.KMSVerifierAddress) {
          // Use @fhevm/mock-utils to create mock FHEVM instance
          if (!MockFhevmInstance) {
            const mockUtils = await import('@fhevm/mock-utils');
            MockFhevmInstance = mockUtils.MockFhevmInstance;
          }
          
          const mockInstance = await MockFhevmInstance.create(provider, provider, {
            aclContractAddress: metadata.ACLAddress,
            chainId: 31337,
            gatewayChainId: 55815,
            inputVerifierContractAddress: metadata.InputVerifierAddress,
            kmsContractAddress: metadata.KMSVerifierAddress,
            verifyingContractAddressDecryption: '0x5ffdaAB0373E62E2ea2944776209aEf29E631A64',
            verifyingContractAddressInputVerification: '0x812b06e1CDCE800494b79fFE4f925A504a9A9810',
          });
          
          fhevmInstance = mockInstance;
          isMockInstance = true;
          lastChainId = currentChainId;
          console.log('[FHEVM] ✅ Mock FHEVM instance created successfully');
          return fhevmInstance;
        } else {
          throw new Error('Failed to get FHEVM metadata from Hardhat node');
        }
      } catch (error: any) {
        console.error('[FHEVM] Failed to create Mock FHEVM instance:', error);
        throw new Error(`Failed to create Mock FHEVM instance: ${error.message || 'Unknown error'}`);
      }
    }
    
    // Sepolia network: Use real FHEVM SDK
    if (currentChainId === 11155111) {
      console.log('[FHEVM] Using real FHEVM SDK for Sepolia...');
      
      try {
        // Dynamically import SDK only when needed for Sepolia
        if (!createInstance || !initSDK || !SepoliaConfig) {
          console.log('[FHEVM] Loading @zama-fhe/relayer-sdk/bundle...');
          try {
            // Try bundle first as it's more reliable
            const sdk = await import('@zama-fhe/relayer-sdk/bundle');
            if (sdk && sdk.createInstance && sdk.initSDK && sdk.SepoliaConfig) {
              createInstance = sdk.createInstance;
              initSDK = sdk.initSDK;
              SepoliaConfig = sdk.SepoliaConfig;
              console.log('[FHEVM] SDK loaded from bundle successfully');
            } else {
              throw new Error('SDK exports are incomplete');
            }
          } catch (importError: any) {
            console.error('[FHEVM] Failed to import SDK from /bundle, trying /web...', importError);
            try {
              // Fallback to web
              const sdk = await import('@zama-fhe/relayer-sdk/web');
              if (sdk && sdk.createInstance && sdk.initSDK && sdk.SepoliaConfig) {
                createInstance = sdk.createInstance;
                initSDK = sdk.initSDK;
                SepoliaConfig = sdk.SepoliaConfig;
                console.log('[FHEVM] SDK loaded from web successfully');
              } else {
                throw new Error('SDK exports are incomplete');
              }
            } catch (webError: any) {
              console.error('[FHEVM] Failed to import SDK from /web:', webError);
              throw new Error(`Failed to load FHEVM SDK. Please ensure you're using localhost network for testing, or check your network connection. Error: ${importError.message || webError.message}`);
            }
          }
        }
        
        // Initialize SDK first (loads WASM)
        if (!isSDKInitialized && initSDK) {
          console.log('[FHEVM] Initializing FHE SDK...');
          await initSDK();
          isSDKInitialized = true;
          console.log('[FHEVM] ✅ SDK initialized successfully');
        }
        
        if (!createInstance || !SepoliaConfig) {
          throw new Error('Failed to load FHEVM SDK functions');
        }
        
        const config = {
          ...SepoliaConfig,
          network: (window as any).ethereum,
        };
        
        console.log('[FHEVM] Creating FHEVM instance...');
        fhevmInstance = await createInstance(config);
        isMockInstance = false;
        lastChainId = currentChainId;
        console.log('[FHEVM] ✅ FHEVM instance created successfully');
        return fhevmInstance;
      } catch (error: any) {
        console.error('[FHEVM] Failed to create FHEVM instance:', error);
        throw new Error(`Failed to create FHEVM instance: ${error.message || 'Unknown error'}`);
      }
    }
    
    // Unsupported network
    throw new Error(`Unsupported chain ID: ${currentChainId}. Supported networks: localhost (31337), Sepolia (11155111)`);
  }
  
  return fhevmInstance;
}

// Encrypt diary content
export async function encryptDiaryContent(
  fhevm: FhevmInstance,
  contractAddress: string,
  userAddress: string,
  content: string
): Promise<EncryptedInput> {
  try {
    // Convert string to bytes and then to number for encryption
    const contentBytes = ethers.toUtf8Bytes(content);
    const contentHash = ethers.keccak256(contentBytes);
    // Take first 32 bytes of hash and convert to BigInt
    const contentNumber = BigInt('0x' + contentHash.slice(2, 66));

    const encryptedInput = fhevm
      .createEncryptedInput(contractAddress, userAddress)
      .add256(contentNumber);
    
    const encrypted = await encryptedInput.encrypt();
    
    // Convert Uint8Array to hex strings for contract calls
    const handles = encrypted.handles.map(handle => {
      const hexHandle = ethers.hexlify(handle);
      // Pad to 32 bytes (64 hex characters) if needed
      if (hexHandle.length < 66) { // 0x + 64 hex chars = 66
        const padded = hexHandle.slice(2).padStart(64, '0');
        return `0x${padded}`;
      }
      // If longer than 32 bytes, take the first 32 bytes
      if (hexHandle.length > 66) {
        return hexHandle.slice(0, 66);
      }
      return hexHandle;
    });
    
    return {
      handles,
      inputProof: ethers.hexlify(encrypted.inputProof),
    };
  } catch (error: any) {
    console.error('Error encrypting diary content:', error);
    throw new Error(`Failed to encrypt diary content: ${error.message || 'Unknown error'}`);
  }
}

// Decrypt diary content
export async function decryptDiaryContent(
  fhevm: FhevmInstance,
  encryptedContent: string,
  contractAddress: string,
  signer: ethers.Signer
): Promise<bigint> {
  try {
    // For mock FHEVM, use userDecryptEuint256
    if (isMockInstance) {
      const decrypted = await (fhevm as any).userDecryptEuint256(
        encryptedContent,
        contractAddress,
        signer
      );
      return decrypted;
    }
    
    // For real FHEVM, use userDecryptEuint with proper type
    const decrypted = await fhevm.userDecryptEuint(
      'euint256',
      encryptedContent,
      contractAddress,
      signer
    );
    return decrypted;
  } catch (error: any) {
    console.error('Failed to decrypt diary content:', error);
    throw new Error(`Failed to decrypt diary content: ${error.message || 'Unknown error'}`);
  }
}
