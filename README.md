# Confidential Airdrop

A confidential airdrop application built on Zama Protocol FHEVM (Fully Homomorphic Encryption Virtual Machine) where recipients receive encrypted token amounts and cannot see their balance until they explicitly decrypt it.

## Features

- **Encrypted Amounts**: All airdrop amounts are encrypted using FHE (Fully Homomorphic Encryption)
- **Batch Airdrops**: Admin can distribute tokens to multiple recipients in a single transaction
- **Privacy-Preserving**: Recipients don't know their balance until they decrypt it
- **Secure Access Control**: Only authorized users can decrypt their own balances

## Project Structure

```
├── contracts/
│   └── ConfidentialAirdrop.sol    # FHE-encrypted smart contract
├── scripts/
│   └── deploy.ts                   # Hardhat deployment script
├── test/
│   └── ConfidentialAirdrop.test.ts # Contract tests
├── frontend/
│   ├── src/
│   │   ├── core/
│   │   │   └── fhevm.ts            # FHEVM SDK initialization
│   │   ├── hooks/
│   │   │   ├── useWallet.ts        # Wallet connection
│   │   │   ├── useFhevm.ts         # SDK state management
│   │   │   ├── useEncrypt.ts       # Encryption operations
│   │   │   └── useDecrypt.ts       # Decryption operations
│   │   ├── components/
│   │   │   ├── AdminPanel.tsx      # Admin interface
│   │   │   └── RecipientPanel.tsx  # Recipient interface
│   │   └── App.tsx                 # Main app component
│   └── vite.config.ts              # Vite configuration
└── hardhat.config.ts               # Hardhat configuration
```

## Prerequisites

- Node.js 18+ and npm
- MetaMask browser extension
- Sepolia ETH for deployment and transactions

## Installation

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Configure Environment Variables

Create `.env` in the root directory:

```bash
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
PRIVATE_KEY=your_private_key_here
```

## Smart Contract Deployment

### Compile Contracts

```bash
npm run compile
```

### Run Tests

```bash
npm run test
```

### Deploy to Sepolia

```bash
npm run deploy:sepolia
```

After deployment, copy the contract address and add it to the frontend `.env`:

```bash
cd frontend
echo "VITE_CONTRACT_ADDRESS=0x..." > .env
```

## Frontend Development

### Start Development Server

```bash
cd frontend
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
cd frontend
npm run build
```

## How It Works

### For Admins (Contract Owner)

1. Connect your wallet (must be the contract owner)
2. Enter recipient addresses (one per line)
3. Enter corresponding amounts (one per line)
4. Click "Execute Batch Airdrop"
5. Amounts are encrypted client-side before being sent to the contract
6. Recipients are notified but cannot see their amounts

### For Recipients

1. Connect your wallet
2. If you've received an airdrop, you'll see a notification
3. Click "Decrypt My Balance" to view your airdrop amount
4. Sign the EIP-712 message to decrypt your balance
5. Your balance is revealed only to you

## Key Technologies

- **Zama FHEVM**: Fully Homomorphic Encryption on Ethereum
- **Hardhat**: Smart contract development and deployment
- **React + TypeScript**: Frontend framework
- **Vite**: Build tool with FHE support
- **Ethers.js v6**: Ethereum library

## Smart Contract Overview

The `ConfidentialAirdrop` contract provides:

- `batchAirdrop()`: Admin function to distribute encrypted amounts to multiple recipients
- `airdrop()`: Single recipient airdrop (convenience function)
- `getEncryptedBalance()`: Recipients can retrieve their encrypted balance handle
- `checkAirdropStatus()`: Check if an address has received an airdrop
- Access Control Lists (ACL) to ensure only recipients can decrypt their balances

## Security Features

- **End-to-End Encryption**: Amounts are encrypted before leaving the browser
- **Access Control**: Only recipients can access their encrypted balances
- **Owner-Only Airdrops**: Only the contract owner can execute airdrops
- **EIP-712 Signatures**: Secure decryption with typed data signatures

## Deployed Contract

- **Contract Address**: `0x982DC8c40AF7a9A33F5019a07faac528ece9B6E0`
- **Network**: Ethereum Sepolia Testnet
- **Chain ID**: 11155111
- **Gateway Chain ID**: 10901 (Zama)
- **RPC**: https://ethereum-sepolia-rpc.publicnode.com


## License

MIT
