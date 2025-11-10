import { ethers } from 'ethers';
import { EncryptedDiary__factory } from '../../../types';

// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  31337: '0x5FbDB2315678afecb367f032d93F642f64180aa3', // Localhost
  11155111: '0x1234567890123456789012345678901234567890', // Sepolia (to be updated after deployment)
} as const;

export type SupportedChainId = keyof typeof CONTRACT_ADDRESSES;

export function getContractAddress(chainId: number): string {
  const address = CONTRACT_ADDRESSES[chainId as SupportedChainId];
  if (!address) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }
  return address;
}

export function getEncryptedDiaryContract(provider: ethers.Provider, chainId: number) {
  const address = getContractAddress(chainId);
  return EncryptedDiary__factory.connect(address, provider);
}

export function getEncryptedDiaryContractWithSigner(signer: ethers.Signer, chainId: number) {
  const address = getContractAddress(chainId);
  return EncryptedDiary__factory.connect(address, signer);
}
