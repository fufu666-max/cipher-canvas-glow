# Wallet Connection Setup

CipherCanvas uses RainbowKit for wallet connectivity. To enable wallet connections, you need to configure a WalletConnect Project ID.

## Getting Your Project ID

1. Visit [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Sign up or log in
3. Create a new project
4. Copy your Project ID
5. Replace `YOUR_PROJECT_ID` in `src/lib/wagmi.ts` with your actual Project ID

## Example Configuration

```typescript
export const config = getDefaultConfig({
  appName: 'CipherCanvas',
  projectId: 'abc123def456...', // Your Project ID here
  chains: [mainnet, polygon, optimism, arbitrum, base],
  ssr: false,
});
```

## Features

Once configured, users can:
- Connect Rainbow Wallet and other popular Web3 wallets
- View their connected wallet address
- Draw on the canvas (requires wallet connection)
- Encrypt artworks (requires wallet connection)
- Prepare for NFT minting

## Supported Chains

- Ethereum Mainnet
- Polygon
- Optimism
- Arbitrum
- Base

You can customize the supported chains in `src/lib/wagmi.ts`.
