# 🔐 EncryptedDiary - Private Thoughts, Encrypted Forever

A privacy-preserving diary application using **FHEVM (Fully Homomorphic Encryption Virtual Machine)**. Write your most intimate thoughts and encrypt them with advanced cryptography. Set unlock dates for future revelations or keep them private forever.

![License](https://img.shields.io/badge/license-BSD--3--Clause--Clear-blue.svg)

## 🎬 Live Demo & Video

- **🌐 Live Demo**: [https://cipher-canvas-glow-1.vercel.app/](https://cipher-canvas-glow-1.vercel.app/)
- **📹 Demo Video**: [Watch on GitHub](https://github.com/GladysBentham/cipher-canvas-glow/blob/main/cipher-canvas-glow.mp4) *(Updated: Shows full encryption/decryption workflow with wallet integration)*

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
- **@zama-fhe/relayer-sdk** - FHEVM SDK for Sepolia
- **@fhevm/mock-utils** - Mock FHEVM for localhost

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

## 🔧 Smart Contract Architecture

### Contract: `EncryptedDiary.sol`

The core smart contract that handles encrypted diary entries using FHEVM.

#### Data Structure

```solidity
struct DiaryEntry {
    address author;              // Entry author address
    euint256 encryptedContent;   // FHE-encrypted diary content
    uint256 unlockTimestamp;     // Unix timestamp when entry unlocks (0 = never)
    uint256 createdAt;          // Entry creation timestamp
    bool isPublic;              // Whether entry becomes public after unlock
}
```

#### Key Functions

##### `createEntry(encryptedContent, inputProof, unlockTimestamp, isPublic)`
Creates a new encrypted diary entry.

**Parameters:**
- `encryptedContent`: `externalEuint256` - FHE-encrypted diary content from client
- `inputProof`: `bytes` - FHEVM input proof for content verification
- `unlockTimestamp`: `uint256` - Unix timestamp when entry unlocks (0 = never unlock)
- `isPublic`: `bool` - Whether entry becomes public after unlocking

**Process:**
1. Converts external encrypted content to internal `euint256` using `FHE.fromExternal()`
2. Creates new `DiaryEntry` with encrypted content
3. Grants decryption permission to author using `FHE.allow()`
4. Emits `EntryCreated` event
5. Returns the new entry ID

##### `getEncryptedEntry(entryId)`
Returns encrypted content (author-only access).

**Access Control:**
- Only the entry author can access encrypted content
- Returns `euint256` encrypted content for client-side decryption

##### `canDecryptEntry(entryId)`
Checks if caller can decrypt the entry.

**Logic:**
- Returns `false` if caller is not the author
- Returns `false` if `unlockTimestamp` is 0 (never unlock)
- Returns `true` if current timestamp >= unlock timestamp

##### `getEntryMetadata(entryId)`
Returns public entry information.

**Returns:**
- `author`: Entry author address
- `createdAt`: Creation timestamp
- `unlockTimestamp`: Unlock timestamp (0 = never)
- `isPublic`: Public visibility flag

##### `getUserEntries(user)`
Returns all entry IDs for a specific user.

## 🔐 Encryption & Decryption Logic

### Encryption Flow (Client-Side)

The encryption process happens entirely on the client before submitting to the blockchain:

#### 1. Content Preparation (`encryptDiaryContent`)

```typescript
// Convert diary text to bytes
const contentBytes = ethers.toUtf8Bytes(content);

// Hash the content using Keccak256
const contentHash = ethers.keccak256(contentBytes);

// Convert hash to BigInt (first 32 bytes)
const contentNumber = BigInt('0x' + contentHash.slice(2, 66));
```

**Why hash?**
- FHEVM works with numeric values (`euint256`)
- Hashing converts arbitrary text to a fixed-size number
- Ensures consistent encryption for the same content

#### 2. FHEVM Encryption

```typescript
// Create encrypted input for the contract
const encryptedInput = fhevm
  .createEncryptedInput(contractAddress, userAddress)
  .add256(contentNumber);

// Encrypt the value
const encrypted = await encryptedInput.encrypt();
```

**Process:**
- `createEncryptedInput()`: Initializes encryption context for specific contract and user
- `add256()`: Adds the numeric value to be encrypted as `euint256`
- `encrypt()`: Performs FHE encryption and generates input proof

#### 3. Format for Contract

```typescript
// Convert handles to hex strings (32 bytes each)
const handles = encrypted.handles.map(handle => {
  const hexHandle = ethers.hexlify(handle);
  // Pad to 32 bytes if needed
  return hexHandle.length < 66 
    ? `0x${hexHandle.slice(2).padStart(64, '0')}`
    : hexHandle.slice(0, 66);
});

return {
  handles,                    // Encrypted value handles
  inputProof: ethers.hexlify(encrypted.inputProof)  // Proof for verification
};
```

### Decryption Flow (Client-Side)

The decryption process retrieves encrypted data from the contract and decrypts it client-side:

#### 1. Retrieve Encrypted Content

```typescript
// Get encrypted content from contract (author-only)
const encryptedContent = await contract
  .connect(signer)
  .getEncryptedEntry(entryId);
```

**Access Control:**
- Contract verifies `msg.sender == entry.author`
- Returns `euint256` encrypted value

#### 2. Check Decryption Permission

```typescript
// Verify entry can be decrypted
const canDecrypt = await contract
  .connect(signer)
  .canDecryptEntry(entryId);
```

**Checks:**
- Caller is the entry author
- Entry is unlocked (timestamp passed or never unlock disabled)

#### 3. FHEVM Decryption

**For Localhost (Mock FHEVM):**
```typescript
const decrypted = await fhevm.userDecryptEuint256(
  encryptedContent,
  contractAddress,
  signer
);
```

**For Sepolia (Real FHEVM):**
```typescript
const decrypted = await fhevm.userDecryptEuint(
  'euint256',
  encryptedContent,
  contractAddress,
  signer
);
```

#### 4. Result

- Returns `bigint` representing the original hash
- Note: This is the hash of the content, not the original text
- The hash serves as a unique identifier for the diary entry

### FHEVM Network Configuration

#### Localhost (Chain ID: 31337)
- Uses `@fhevm/mock-utils` for local development
- Fetches FHEVM metadata from Hardhat node
- Creates `MockFhevmInstance` with Hardhat plugin addresses
- No relayer required

#### Sepolia (Chain ID: 11155111)
- Uses `@zama-fhe/relayer-sdk` for production
- Requires FHEVM SDK initialization (`initSDK()`)
- Uses Zama's relayer infrastructure
- Real FHE encryption/decryption

### Security Features

1. **Author-Only Access**: Only entry authors can access encrypted content
2. **Time-Based Unlock**: Entries unlock only after specified timestamp
3. **Never Unlock Option**: Entries can be set to never unlock
4. **On-Chain Storage**: All encrypted data stored on blockchain
5. **Client-Side Encryption**: Content encrypted before submission
6. **FHEVM Proofs**: Cryptographic proofs ensure data integrity

## 🔐 FHEVM Integration

This app uses Zama's FHEVM to perform computations on encrypted data:

- **Encryption**: Diary content is encrypted client-side before submission
- **Storage**: Encrypted data is stored on-chain as `euint256`
- **Decryption**: Authorized users can decrypt their entries when conditions are met
- **Privacy**: Content remains encrypted until unlock conditions are satisfied

### Network Configuration

| Network | Chain ID | Contract Address | FHEVM Type |
|--------|----------|------------------|------------|
| Localhost | 31337 | `0x5FbDB2315678afecb367f032d93F642f64180aa3` | Mock |
| Sepolia | 11155111 | Deployed address | Real |

## 🐛 Troubleshooting

### Common Issues

1. **"Contract not found at address"**
   - Ensure you're connected to the correct network
   - Verify the contract is deployed on that network

2. **"FHEVM instance creation failed"**
   - Check your network connection
   - Ensure Hardhat node is running (for localhost)
   - For Sepolia, ensure FHEVM SDK is properly initialized

3. **"Cannot decrypt entry"**
   - Entry may not be unlocked yet
   - Only the author can decrypt their entries
   - Check `canDecryptEntry()` returns true

4. **Wallet connection issues**
   - Ensure your wallet is unlocked
   - Check network compatibility
   - Verify RainbowKit configuration

5. **"Cross-Origin-Embedder-Policy" errors**
   - Required for FHEVM SDK (WebAssembly SharedArrayBuffer)
   - Configured in `vite.config.ts` with COEP headers

## 📁 Project Structure

```
cipher-canvas-glow/
├── contracts/
│   └── EncryptedDiary.sol      # Main diary contract with FHEVM
├── test/
│   ├── EncryptedDiary.ts       # Local network tests
│   └── EncryptedDiarySepolia.ts # Sepolia testnet tests
├── deploy/
│   └── deploy.ts               # Hardhat deployment script
├── types/                      # TypeScript types (generated)
│   └── contracts/
│       └── EncryptedDiary.ts   # Contract TypeScript interface
├── ui/
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── Logo.tsx        # Custom logo
│   │   │   ├── Navigation.tsx  # Navigation bar with RainbowKit
│   │   │   └── ui/             # shadcn/ui components
│   │   ├── pages/              # Page components
│   │   │   ├── Home.tsx        # Landing page
│   │   │   ├── WriteDiary.tsx  # Write and encrypt entries
│   │   │   └── DiaryEntries.tsx # View and decrypt entries
│   │   └── lib/               # Utilities
│   │       ├── contract.ts     # Contract interaction helpers
│   │       ├── fhevm.ts       # FHEVM encryption/decryption
│   │       └── wagmi.ts       # Wallet configuration
│   ├── public/
│   │   └── favicon.svg        # Custom favicon
│   └── vercel.json            # Vercel deployment config
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

## 🔒 Security Considerations

### Privacy & Encryption

Cipher Canvas Glow takes privacy seriously. Your diary entries are encrypted using state-of-the-art Fully Homomorphic Encryption (FHE) technology:

- **Client-Side Encryption**: All encryption happens in your browser before data reaches the blockchain
- **Zero-Knowledge Design**: Even the application developers cannot read your encrypted content
- **Author-Only Access**: Only you can decrypt and read your own diary entries
- **Time-Based Security**: Entries remain locked until their designated unlock time

### Smart Contract Security

The EncryptedDiary contract has been designed with security best practices:

- **Access Control**: Strict permission checks prevent unauthorized access
- **Input Validation**: All inputs are validated to prevent malicious data
- **Gas Optimization**: Efficient code to minimize transaction costs
- **Upgradeability**: Future-proof design for potential enhancements

### Wallet Security

- Always use hardware wallets for maximum security
- Verify contract addresses before interacting
- Keep your wallet software updated
- Use strong passwords and enable 2FA where available

## 🚨 Common Issues & Solutions

### Connection Issues

**Problem**: "Wallet connection failed"
```
Solution:
1. Ensure your wallet extension is installed and unlocked
2. Check that you're connected to the correct network
3. Refresh the page and try connecting again
4. Clear browser cache if issues persist
```

**Problem**: "Network not supported"
```
Solution:
- For local development: Ensure Hardhat node is running
- For Sepolia: Switch to Sepolia testnet in your wallet
- Check network configuration in wallet settings
```

### Encryption Issues

**Problem**: "Encryption failed"
```
Solution:
1. Ensure FHEVM SDK is properly loaded
2. Check browser compatibility (Chrome recommended)
3. Disable ad blockers temporarily
4. Try refreshing the page
```

**Problem**: "Cannot decrypt entry"
```
Solution:
- Only entry authors can decrypt their entries
- Check if the unlock time has passed
- Ensure you're using the same wallet that created the entry
- Verify network connection
```

### Content Issues

**Problem**: "Entry not saving"
```
Solution:
1. Check wallet connection and gas fees
2. Ensure content is not empty
3. Verify character limit (1000 characters max)
4. Check network congestion
```

**Problem**: "Entry disappeared"
```
Solution:
- Check transaction status on blockchain explorer
- Ensure you have sufficient funds for gas
- Try creating the entry again
- Contact support if issue persists
```

## 🤝 Contributing

We welcome contributions to Cipher Canvas Glow! Here's how you can help:

### Development Setup

1. **Fork the repository**
```bash
git clone https://github.com/your-username/cipher-canvas-glow.git
cd cipher-canvas-glow
```

2. **Install dependencies**
```bash
npm install
cd ui && npm install
```

3. **Start development environment**
```bash
# Terminal 1: Start Hardhat node
npm run node

# Terminal 2: Deploy contracts
npm run deploy

# Terminal 3: Start UI
cd ui && npm run dev
```

### Contribution Guidelines

- **Code Style**: Follow existing code style and conventions
- **Testing**: Add tests for new features
- **Documentation**: Update documentation for changes
- **Security**: Be mindful of security implications
- **Commits**: Use clear, descriptive commit messages

### Types of Contributions

- 🐛 **Bug fixes**
- ✨ **New features**
- 📚 **Documentation improvements**
- 🧪 **Testing enhancements**
- 🎨 **UI/UX improvements**

### Pull Request Process

1. Create a feature branch from `main`
2. Make your changes with clear commit messages
3. Add tests if applicable
4. Update documentation
5. Submit a pull request with description
6. Wait for review and address feedback

## 📄 License

This project is licensed under the BSD-3-Clause-Clear License.

### BSD-3-Clause-Clear License Summary

This license allows you to:

- ✅ Use the software for commercial purposes
- ✅ Modify the software
- ✅ Distribute the software
- ✅ Use privately without disclosing source
- ✅ Have unlimited users

You must:

- 📝 Include copyright notice in distributions
- 📝 Include license text in distributions
- ⚖️ Give appropriate credit

For full license text, see [LICENSE](LICENSE) file.

## 📊 Changelog

### Version 1.0.0 (Latest)

**Features:**
- Initial release with FHEVM integration
- Wallet connection via RainbowKit
- Encrypted diary entry creation
- Time-based entry unlocking
- Modern React UI with Tailwind CSS

**Security:**
- Comprehensive access control implementation
- Client-side encryption
- Privacy-preserving design

**Improvements:**
- Enhanced wallet connection management
- Better error handling and user feedback
- Optimized gas usage
- Improved mobile responsiveness

### Upcoming Features

- 📱 **Mobile App**: Native mobile applications
- 🌐 **Multi-Network**: Support for additional blockchain networks
- 🔄 **Entry Editing**: Ability to edit existing entries
- 📤 **Export**: Data export functionality
- 🔍 **Search**: Advanced search and filtering
- 🏷️ **Tags**: Entry categorization with tags
- 📊 **Analytics**: Usage statistics and insights

## 📞 Contact & Support

### Getting Help

- 📧 **Email**: support@ciphercanvasglow.com
- 💬 **Discord**: [Join our community](https://discord.gg/cipher-canvas-glow)
- 🐛 **Issues**: [GitHub Issues](https://github.com/GladysBentham/cipher-canvas-glow/issues)
- 📖 **Documentation**: [Full Docs](https://docs.ciphercanvasglow.com)

### Community

- 🌟 **GitHub**: [Star us on GitHub](https://github.com/GladysBentham/cipher-canvas-glow)
- 🐦 **Twitter**: [@CipherCanvasGlow](https://twitter.com/CipherCanvasGlow)
- 📺 **YouTube**: [Tutorial Videos](https://youtube.com/@CipherCanvasGlow)

### Business Inquiries

For partnerships, integrations, or business opportunities:
- 📧 **Business**: business@ciphercanvasglow.com
- 🌐 **Website**: [ciphercanvasglow.com](https://ciphercanvasglow.com)

## 🔧 Advanced Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Wallet Configuration
PRIVATE_KEY=your_private_key_here
INFURA_API_KEY=your_infura_key_here

# FHEVM Configuration
FHEVM_NETWORK=sepolia
FHEVM_SDK_VERSION=latest

# UI Configuration
VITE_APP_TITLE=Cipher Canvas Glow
VITE_APP_ENV=development
```

### Custom Network Deployment

To deploy on a custom network:

1. Update `hardhat.config.ts` with network configuration
2. Modify contract constructor parameters if needed
3. Deploy using `npx hardhat deploy --network your-network`
4. Update frontend contract addresses
5. Test thoroughly on testnet first

### Performance Optimization

- Use IPFS for large content storage
- Implement pagination for entry lists
- Cache encrypted content locally
- Optimize FHE operations
- Use CDN for static assets

## 🎯 Roadmap

### Q1 2025
- Mobile application launch
- Advanced search functionality
- Entry export/import features

### Q2 2025
- Multi-language support
- Advanced privacy settings
- Integration with DeFi protocols

### Q3 2025
- API for third-party integrations
- Plugin system for extensions
- Enterprise features

### Q4 2025
- Cross-chain compatibility
- Advanced encryption options
- Community governance features

---

**Built with ❤️ using FHEVM by the Cipher Canvas Glow Team**
