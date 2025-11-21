# 🔐 EncryptedDiary - Private Thoughts, Encrypted Forever

A privacy-preserving diary application using **FHEVM (Fully Homomorphic Encryption Virtual Machine)**. Write your most intimate thoughts and encrypt them with advanced cryptography. Set unlock dates for future revelations or keep them private forever.

![License](https://img.shields.io/badge/license-BSD--3--Clause--Clear-blue.svg)

## ✨ Features

- 🔒 **Privacy-First**: Your diary entries are encrypted using Fully Homomorphic Encryption
- ⏰ **Time Capsules**: Set unlock dates for future revelations or keep entries private forever
- 🌐 **Decentralized**: All data stored on-chain, no central database required
- 💼 **Wallet Integration**: RainbowKit for seamless wallet connections
- 📱 **Modern UI**: Built with React, TypeScript, and Tailwind CSS

## 🎯 Use Cases

- **Personal Journaling**: Keep private thoughts encrypted and secure
- **Time Capsules**: Write messages to your future self
- **Legacy Planning**: Leave encrypted messages for loved ones
- **Mental Health**: Safe space for thoughts that need time before reflection

## 🛠️ Tech Stack

### Smart Contracts
- **Solidity** ^0.8.24
- **FHEVM** - Fully Homomorphic Encryption Virtual Machine
- **Hardhat** - Development environment
- **Ethers.js** ^6.15.0

### Frontend
- **React** ^18.3.1
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **RainbowKit** - Wallet connection
- **Wagmi / Viem** - Ethereum integration
- **@zama-fhe/relayer-sdk** - FHEVM SDK

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 20
- **npm** >= 7.0.0
- A Web3 wallet (MetaMask, Rainbow, etc.)
- Testnet ETH (for Sepolia deployment)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/GladysBentham/cipher-canvas-glow.git
cd cipher-canvas-glow
```

2. **Install contract dependencies**
```bash
npm install
```

3. **Install UI dependencies**
```bash
cd ui
npm install
```

## 📦 Contract Deployment

### Local Network (Hardhat)

1. **Start a local Hardhat node**
```bash
npx hardhat node
```

2. **Deploy the contract** (in another terminal)
```bash
npx hardhat deploy --network localhost
```

3. **Contract Address (local)**: `0x5FbDB2315678afecb367f032d93F642f64180aa3`

### Sepolia Testnet

1. **Set up environment variables**
```bash
npx hardhat vars set PRIVATE_KEY
npx hardhat vars set INFURA_API_KEY
```

2. **Deploy to Sepolia**
```bash
npx hardhat deploy --network sepolia
```

## 🧪 Testing

### Local Network Tests
```bash
npm run test
```

### Sepolia Testnet Tests
```bash
npx hardhat test --network sepolia test/EncryptedDiarySepolia.ts
```

## 🌐 Running the UI

1. **Navigate to the UI directory**
```bash
cd ui
```

2. **Start the development server**
```bash
npm run dev
```

3. **Open your browser**: Navigate to `http://localhost:5173`

4. **Connect your wallet**
   - Click "Connect Wallet" (top right)
   - Select your wallet (MetaMask, Rainbow, etc.)
   - Ensure you're connected to the correct network (localhost or Sepolia)

## 📖 How to Use

### Writing a Diary Entry

1. **Connect your wallet** using RainbowKit
2. **Navigate to "Write Entry"**
3. **Write your thoughts** in the text area
4. **Set unlock options**:
   - Choose an unlock date using the calendar
   - Or select "Never unlock" to keep it private forever
   - Optionally make it public after unlocking
5. **Click "Save Entry"** to encrypt and store on-chain

### Viewing Your Entries

1. **Go to "My Diary"** to see all your entries
2. **Locked entries** show unlock status and date
3. **Unlocked entries** can be decrypted to reveal the content
4. **Public entries** may be visible to others after unlock

## 🔧 Smart Contract Details

### `createEntry(encryptedContent, inputProof, unlockTimestamp, isPublic)`
Creates a new encrypted diary entry.

**Parameters:**
- `encryptedContent`: FHE-encrypted diary content
- `inputProof`: FHEVM input proof
- `unlockTimestamp`: Unix timestamp when entry unlocks (0 = never)
- `isPublic`: Whether entry becomes public after unlock

### `getEncryptedEntry(entryId)`
Returns encrypted content (author-only access).

### `canDecryptEntry(entryId)`
Checks if caller can decrypt the entry.

### `getEntryMetadata(entryId)`
Returns public entry information.

### `getUserEntries(user)`
Returns all entry IDs for a user.

## 🔐 FHEVM Integration

This app uses Zama's FHEVM to perform computations on encrypted data:

- **Encryption**: Diary content is encrypted client-side before submission
- **Storage**: Encrypted data is stored on-chain
- **Decryption**: Authorized users can decrypt their entries when conditions are met
- **Privacy**: Content remains encrypted until unlock conditions are satisfied

### Network Configuration

| Network | Chain ID | Contract Address |
|--------|----------|------------------|
| Localhost | 31337 | `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512` |
| Sepolia | 11155111 | Deployed address |

## 🐛 Troubleshooting

### Common Issues

1. **"Contract not found at address"**
   - Ensure you're connected to the correct network
   - Verify the contract is deployed on that network

2. **"FHEVM instance creation failed"**
   - Check your network connection
   - Ensure Hardhat node is running (for localhost)

3. **"Cannot decrypt entry"**
   - Entry may not be unlocked yet
   - Only the author can decrypt their entries

4. **Wallet connection issues**
   - Ensure your wallet is unlocked
   - Check network compatibility

## 📁 Project Structure

```
cipher-canvas-glow/
├── contracts/
│   └── EncryptedDiary.sol      # Main diary contract
├── test/
│   ├── EncryptedDiary.ts       # Local tests
│   └── EncryptedDiarySepolia.ts # Sepolia tests
├── deploy/
│   └── deploy.ts               # Deployment script
├── ui/
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/             # Page components
│   │   │   ├── Home.tsx       # Landing page
│   │   │   ├── WriteDiary.tsx # Write entries
│   │   │   └── DiaryEntries.tsx # View entries
│   │   └── lib/               # Utilities
│   │       ├── contract.ts    # Contract interaction
│   │       ├── fhevm.ts      # FHEVM utilities
│   │       └── wagmi.ts      # Wallet config
│   └── public/                # Static assets
└── hardhat.config.ts          # Hardhat configuration
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the BSD-3-Clause-Clear License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Zama](https://www.zama.ai/) for FHEVM technology
- [Hardhat](https://hardhat.org/) for the development environment
- [RainbowKit](https://www.rainbowkit.com/) for wallet integration
- [Viem](https://viem.sh/) and [Wagmi](https://wagmi.sh/) for Ethereum integration

---

**Built with ❤️ using FHEVM**
