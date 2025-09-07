# EVOLVEX BLOCKFREE

<div align="center">
  <img src="public/EVO.splinecode" alt="EVOLVEX Logo" width="200" height="200"/>
  
  <h3>🚀 Decentralized Freelancing Platform on Aptos Blockchain</h3>
  
  <p>A revolutionary blockchain-based freelancing platform that connects developers, verifiers, and clients in a secure, transparent, and efficient ecosystem.</p>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Aptos](https://img.shields.io/badge/Built%20on-Aptos-000000?style=flat&logo=aptos)](https://aptoslabs.com/)
  [![Move](https://img.shields.io/badge/Smart%20Contracts-Move-000000?style=flat)](https://move-language.github.io/)
  [![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=flat&logo=react)](https://reactjs.org/)
</div>

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Aptos & Move Integration](#aptos--move-integration)
- [Installation](#installation)
- [Usage](#usage)
- [Screenshots](#screenshots)
- [Smart Contracts](#smart-contracts)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## 🌟 Overview

EVOLVEX is a cutting-edge decentralized freelancing platform built on the Aptos blockchain. It revolutionizes the traditional freelancing model by introducing blockchain-based verification, transparent payments, and community-driven governance.

### 🎯 Problem Solved

- **Trust Issues**: Traditional freelancing platforms suffer from payment disputes and lack of transparency
- **Verification Challenges**: No reliable way to verify code quality and developer credentials
- **Payment Security**: Centralized platforms can freeze or hold payments
- **Community Engagement**: Limited interaction between developers and the broader community

### 💡 Our Solution

- **Blockchain Verification**: Smart contracts ensure code quality and payment security
- **Role-Based Access**: Three distinct roles (Client, Developer, Verifier) with specific permissions
- **Transparent Payments**: All transactions recorded on Aptos blockchain
- **Community Features**: Q&A system, rewards, and project showcases

## ✨ Key Features

### 🔐 Role-Based System

#### 👤 **Client Role**
- Post freelance projects with detailed requirements
- Set budgets and deadlines
- Review and hire freelancers
- Make secure payments through smart contracts

#### 👨‍💻 **Developer Role**
- Browse available projects 
- Submit proposals and code
- Access developer tools and resources
- Earn rewards for quality work

#### 🛡️ **Verifier Role**
- Purchase NFT to become a verified code reviewer
- Review and verify submitted code
- Earn rewards for verification work
- Maintain platform quality standards

### 🚀 Core Functionality

- **Smart Contract Integration**: All operations backed by Aptos smart contracts
- **Real-time Updates**: Live project status and payment trackingdde
- **Code Verification**: Automated and manual code quality checks
- **Community Features**: Q&A system, project showcases, and leaderboards
- **Reward System**: Token-based rewards for contributions
- **Monochrome UI**: Clean, professional interface design

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                        │
├─────────────────────────────────────────────────────────────┤
│  • Role-based Dashboards  • Community Features            │
│  • Project Management     • Real-time Updates             │
│  • Payment Interface      • Code Editor                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Backend Services                           │
├─────────────────────────────────────────────────────────────┤
│  • Firebase (Database)    • API Integration               │
│  • Authentication        • File Storage                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                Aptos Blockchain                            │
├─────────────────────────────────────────────────────────────┤
│  • Smart Contracts       • Payment Processing             │
│  • Code Verification     • NFT Management                 │
│  • Transaction Records   • Governance                     │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **React Router DOM** - Client-side routing
- **Lucide React** - Icon library
- **Chart.js** - Data visualization
- **Spline** - 3D graphics and animations

### Backend & Database
- **Firebase** - Real-time database and authentication
- **Firestore** - NoSQL document database
- **Firebase Storage** - File storage solution

### Blockchain
- **Aptos** - High-performance blockchain platform
- **Move** - Smart contract programming language
- **Petra Wallet** - Aptos wallet integration
- **Aptos SDK** - Blockchain interaction

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Axios** - HTTP client
- **Socket.io** - Real-time communication

## 🔗 Aptos & Move Integration

### Why Aptos?

- **High Performance**: 100,000+ TPS with sub-second finality
- **Move Language**: Designed for safe and secure smart contracts
- **Developer Friendly**: Excellent tooling and documentation
- **Low Fees**: Cost-effective transactions
- **Scalability**: Built for mass adoption

### Move Smart Contracts

Our platform leverages Move's unique features:

#### 🔒 **Resource-Oriented Programming**
```move
struct Submission has store, copy, drop {
    id: u64,
    submitter: address,
    code_hash: vector<u8>,
    title: String,
    description: String,
    status: u8,
    // ... more fields
}
```

#### 🛡️ **Built-in Security**
- Linear types prevent double-spending
- Resource capabilities ensure proper access control
- Formal verification support

#### ⚡ **Gas Efficiency**
- Optimized for blockchain operations
- Minimal gas costs for common operations
- Batch transaction support

### Smart Contract Features

1. **Submission Tracking**: Track code submissions and their status
2. **Payment Processing**: Secure escrow and payment release
3. **Verification System**: NFT-based verifier access control
4. **Governance**: Community-driven decision making
5. **Event Logging**: Transparent audit trail

## 🚀 Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Petra Wallet (Aptos wallet)
- Git

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/evolvex-blockfree.git
   cd evolvex-blockfree
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Create .env file
   cp .env.example .env
   
   # Add your configuration
   VITE_APTOS_NETWORK=testnet
   VITE_FIREBASE_API_KEY=your_firebase_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 📱 Usage

### Getting Started

1. **Install Petra Wallet**
   - Download from [Petra Wallet](https://petra.app/)
   - Create or import your Aptos wallet
   - Switch to testnet for development

2. **Connect Wallet**
   - Click "Connect Petra Wallet" on the homepage
   - Approve the connection in your wallet

3. **Choose Your Role**
   - **Client**: Post projects and hire freelancers
   - **Developer**: Browse projects and submit code
   - **Verifier**: Purchase NFT and verify code

### For Clients

1. Connect your wallet
2. Select "Client" role
3. Post a new project with requirements
4. Review submitted proposals
5. Hire and pay freelancers

### For Developers

1. Connect your wallet
2. Select "Developer" role
3. Browse available projects
4. Submit proposals and code
5. Get paid upon project completion

### For Verifiers

1. Connect your wallet
2. Select "Verifier" role
3. Purchase verification NFT (1 APT)
4. Review and verify submitted code
5. Earn rewards for verification work

## 📸 Screenshots

### 🏠 Homepage
![Homepage](screenshots/homepage.png)
*Clean, modern homepage with role selection*

### 👤 Client Dashboard
![Client Dashboard](screenshots/client-dashboard.png)
*Project management and hiring interface*

### 👨‍💻 Developer Zone
![Developer Zone](screenshots/developer-zone.png)
*Code submission and project browsing*

### 🛡️ Verifier Dashboard
![Verifier Dashboard](screenshots/verifier-dashboard.png)
*Code verification and review interface*

### 💬 Community Features
![Community](screenshots/community.png)
*Q&A system and project showcases*

### 🏆 Rewards System
![Rewards](screenshots/rewards.png)
*Token rewards and achievement tracking*

## 📜 Smart Contracts

### Submission Tracker Contract

Our main smart contract handles:

- **Code Submissions**: Store and track code submissions
- **Status Management**: Pending, approved, rejected states
- **Verification System**: NFT-based access control
- **Event Logging**: Transparent audit trail

### Key Functions

```move
public entry fun submit_code(
    submitter: &signer,
    title: String,
    description: String,
    code_hash: vector<u8>
) acquires UserSubmissions

public entry fun verify_submission(
    verifier: &signer,
    submission_id: u64,
    approved: bool,
    comments: String
) acquires UserSubmissions

public entry fun purchase_verifier_nft(
    buyer: &signer
) acquires VerifierNFTs
```

### Contract Address
```
Testnet: 0x2c449df63159be31e0482f03613355693bacd22b58419dd0d85c342346a615b6
```

## 📚 API Documentation

### Firebase Collections

#### Projects
```javascript
{
  id: string,
  title: string,
  description: string,
  budget: number,
  deadline: string,
  status: 'open' | 'in_progress' | 'completed',
  client: string,
  developer: string,
  createdAt: timestamp
}
```

#### Submissions
```javascript
{
  id: string,
  projectId: string,
  developer: string,
  code: string,
  status: 'pending' | 'approved' | 'rejected',
  submittedAt: timestamp
}
```

### Aptos API Integration

```javascript
// Connect to Aptos
const client = new AptosClient(APTOS_NETWORK);

// Get account resources
const resources = await client.getAccountResources(accountAddress);

// Submit transaction
const transaction = await client.generateTransaction(sender, payload);
const signedTxn = await client.signTransaction(transaction);
const result = await client.submitTransaction(signedTxn);
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Sarthak Patil** - Full Stack Developer
- **Om Berad** - Blockchain Developer  
- **Satyam Singh** - Full Stack Developer


## 📞 Contact

- **Email**: evolvex.blockfree@gmail.com
- **GitHub**: [@evolvex-blockfree](https://github.com/evolvex-blockfree)
- **Discord**: [Join our community](https://discord.gg/evolvex)
- **Twitter**: [@evolvex_blockfree](https://twitter.com/evolvex_blockfree)

## 🙏 Acknowledgments

- [Aptos Labs](https://aptoslabs.com/) for the amazing blockchain platform
- [Move Language](https://move-language.github.io/) for secure smart contracts
- [React Team](https://reactjs.org/) for the excellent frontend framework
- [Firebase](https://firebase.google.com/) for backend services

---

<div align="center">
  <p>Built with ❤️ by the EVOLVEX Team</p>
  <p>🚀 Revolutionizing freelancing on the blockchain</p>
</div>