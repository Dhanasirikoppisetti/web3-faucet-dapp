# Web3 Faucet DApp

A complete decentralized application (DApp) demonstrating Web3 development capabilities with a token distribution system that enforces rate limits through smart contracts deployed on Sepolia testnet.

## Overview

This project implements:
- An ERC-20 token (`FaucetToken`) with fixed max supply and faucet-only minting
- A `TokenFaucet` contract enforcing 24-hour cooldowns and lifetime claim limits
- A React + Vite frontend with MetaMask integration
- Dockerized deployment with health checks
- Evaluation interface (`window.__EVAL__`) for automated testing

## Deployed Contracts (Sepolia)

- **FaucetToken**: `0x77b1111B40B3AfD0AF48752a978359E3B34eb863`
  - [View on Etherscan](https://sepolia.etherscan.io/address/0x77b1111B40B3AfD0AF48752a978359E3B34eb863#code)

- **TokenFaucet**: `0x39D5c60Cb7025Cd03DB4e86982884557154aB0e6`
  - [View on Etherscan](https://sepolia.etherscan.io/address/0x39D5c60Cb7025Cd03DB4e86982884557154aB0e6#code)

## Features

### Smart Contracts
- ✅ ERC-20 compliant token with fixed 1,000,000 token max supply
- ✅ Faucet distributes 100 tokens per claim
- ✅ 24-hour cooldown between claims per address
- ✅ Lifetime limit of 5 claims per address (500 tokens total)
- ✅ Pause/unpause mechanism (admin only)
- ✅ Events emitted for all state changes
- ✅ Clear revert messages for all error conditions

### Frontend
- ✅ MetaMask wallet integration (EIP-1193)
- ✅ Real-time display of token balance and claim status
- ✅ Cooldown timer showing time remaining until next claim
- ✅ Remaining lifetime allowance display
- ✅ Loading states during transaction processing
- ✅ User-friendly error messages
- ✅ Automatic UI updates after successful claims

## Quick Start

### Using Docker (Recommended)

\`\`\`bash
cd submission
cp .env.example .env
# Edit .env with your values
docker compose up --build
\`\`\`

Access the app at \`http://localhost:3000\`

Health check: \`http://localhost:3000/health.json\`

### Local Development

\`\`\`bash
# Install dependencies
npm install
cd frontend && npm install

# Start local Hardhat node (optional)
npx hardhat node

# Deploy contracts
npx hardhat run scripts/deploy.js --network sepolia

# Start frontend dev server
cd frontend
npm run dev
\`\`\`

## Configuration

Create \`.env\` in project root:

\`\`\`env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
SEPOLIA_KEY=your_sepolia_private_key_here
ETHERSCAN_KEY=your_etherscan_api_key_here

VITE_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
VITE_TOKEN_ADDRESS=0x77b1111B40B3AfD0AF48752a978359E3B34eb863
VITE_FAUCET_ADDRESS=0x39D5c60Cb7025Cd03DB4e86982884557154aB0e6
\`\`\`

## Testing

Run comprehensive smart contract tests:

\`\`\`bash
npx hardhat test
\`\`\`

Tests cover:
- Token deployment and initial state
- Faucet deployment and configuration
- Successful token claims
- Cooldown enforcement
- Lifetime limit enforcement
- Pause mechanism
- Admin-only functions
- Event emissions
- Multiple users claiming independently

All 10 tests pass.

## Evaluation Interface

The frontend exposes \`window.__EVAL__\` for automated testing:

\`\`\`javascript
// Connect wallet
await window.__EVAL__.connectWallet()
// Returns: "0xYourAddress"

// Request tokens
await window.__EVAL__.requestTokens()
// Returns: "0xtransactionHash"

// Get token balance
await window.__EVAL__.getBalance("0xAddress")
// Returns: "100000000000000000000" (as string)

// Get remaining lifetime allowance
await window.__EVAL__.getRemainingAllowance("0xAddress")
// Returns: "400000000000000000000" (as string)

// Get contract addresses
await window.__EVAL__.getContractAddresses()
// Returns: {token: "0x...", faucet: "0x..."}
\`\`\`

**Note**: The \`canClaim()\` function logic is implemented internally within \`requestTokens()\` for claim eligibility checking.

## Design Decisions

### Faucet Amount
**100 tokens (100 ether in base units)** per claim provides a meaningful amount for testing while staying within reasonable gas costs.

### Cooldown Period
**24 hours** demonstrates time-based rate limiting and prevents spam without being too restrictive for testing.

### Lifetime Limit
**5 claims (500 tokens total)** per address enforces scarcity and demonstrates on-chain state tracking across multiple transactions.

### Max Supply
**1,000,000 tokens** provides ample supply for testing while enforcing a hard cap to prevent infinite inflation.

## Architecture

### Smart Contracts (\`contracts/\`)
- \`Token.sol\`: ERC-20 token with mint restriction
- \`TokenFaucet.sol\`: Rate-limited token distribution

### Frontend (\`frontend/\`)
- React + Vite for fast development
- ethers.js v6 for blockchain interaction
- Responsive design for mobile and desktop

### Infrastructure
- Multi-stage Docker build for optimized images
- Health check endpoint for container orchestration
- Environment-based configuration

## Security Considerations

- ✅ Checks-Effects-Interactions pattern in \`requestTokens()\`
- ✅ Solidity 0.8.20 with built-in overflow protection
- ✅ Access control: only admin can pause, only faucet can mint
- ✅ No reentrancy risk (no external calls before state updates)
- ✅ Clear revert messages for debugging
- ✅ Public mappings for transparency

## Known Limitations

- Testnet only (Sepolia) - not intended for mainnet
- Fixed claim amount (no dynamic adjustments)
- Single admin (no multi-sig)
- No token transfer restrictions after claiming

## Technology Stack

- **Smart Contracts**: Solidity 0.8.20
- **Development Framework**: Hardhat 2.22.2
- **Testing**: Chai, Hardhat Network
- **Frontend**: React 18, Vite 5
- **Blockchain Library**: ethers.js 6
- **Deployment**: Docker, Docker Compose
- **Network**: Ethereum Sepolia Testnet

## Project Structure

\`\`\`
submission/
├── contracts/
│   ├── Token.sol
│   └── TokenFaucet.sol
├── test/
│   └── TokenFaucet.test.cjs
├── scripts/
│   └── deploy.js
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── utils/
│   │       ├── contracts.js
│   │       └── eval.js
│   ├── public/
│   │   └── health.json
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── hardhat.config.js
├── .env.example
└── README.md
\`\`\`

## License

MIT
EOF