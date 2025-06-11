# 🚀 MPAS - Monad Performance Analytics Suite

> **Real-time blockchain performance analytics and benchmarking toolkit for Monad network**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-Available-success)](your-deployment-url)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)
[![Built with Next.js](https://img.shields.io/badge/Built_with-Next.js-black)](https://nextjs.org/)
[![Monad Network](https://img.shields.io/badge/Network-Monad_Testnet-purple)](https://monad.xyz)

## ✨ **Features**

### 🔥 **Real-time Analytics**
- **Live TPS Monitoring** - Real-time transactions per second tracking
- **Network Health Dashboard** - Block time, gas prices, and connection status
- **Smart RPC Failover** - Automatic failover between multiple RPC endpoints
- **Historical Data Charts** - Interactive performance visualizations

### ⚡ **Benchmark Testing**
- **ERC20 Stress Tests** - Mass transfer and airdrop simulations
- **NFT Batch Operations** - Large-scale NFT minting benchmarks
- **DeFi Protocol Testing** - Complex swap and interaction testing
- **Multi-Contract Scenarios** - Cross-contract performance evaluation

### 🎯 **Live Transaction Feed**
- **Real-time TX Stream** - Live transaction monitoring with categorization
- **Transaction Analytics** - Success rates, gas usage, and performance metrics
- **Network Activity Pulse** - Visual indicators of network activity

### 🔧 **Developer Tools**
- **API Endpoints** - RESTful APIs for metrics and benchmark data
- **Foundry Integration** - Smart contract benchmark execution
- **Database Storage** - Persistent metrics and test result storage
- **Export Capabilities** - Data export for further analysis

## 🏗️ **Architecture**

```
🎨 Frontend (Next.js + TypeScript + TailwindCSS)
├── 📊 Real-time Dashboard
├── 🧪 Benchmark Testing Interface  
├── 📈 Interactive Charts & Analytics
└── 🔴 Live Transaction Feed

⚙️ Backend (Next.js API Routes)
├── 🌐 Monad Network Integration
├── 📦 Database Management
├── 🔨 Foundry Script Execution
└── 📡 RESTful API Endpoints

🔗 Blockchain Integration
├── 📟 Multi-RPC Failover System
├── ⛓️ Smart Contract Interaction
├── 📊 Real-time Metrics Collection
└── 🧪 Automated Benchmark Execution
```

## 🚀 **Quick Start**

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/Lesnak1/monad-performance-analytics.git
cd monad-performance-analytics

# Install dependencies
cd frontend
npm install

# Start development server
npm run dev
```

### Environment Setup (Optional)

Create `.env.local` in the frontend directory:

```env
# Custom RPC endpoints (optional)
NEXT_PUBLIC_MONAD_RPC_URL=https://monad-testnet.rpc.hypersync.xyz
NEXT_PUBLIC_BACKUP_RPC_1=https://testnet-rpc.monad.xyz
NEXT_PUBLIC_BACKUP_RPC_2=https://monad-testnet.drpc.org

# Database (for production)
DATABASE_URL=your_database_url_here
```

## 📖 **Usage**

### 🏠 **Dashboard**
- View real-time Monad network metrics
- Monitor TPS, block time, and gas prices
- Access network health indicators
- Browse historical performance data

### 🧪 **Benchmark Testing**
1. Navigate to `/benchmarks`
2. Select test type (ERC20, NFT, DeFi, Multi-Contract)
3. Configure test parameters
4. Execute and monitor real-time results
5. Export results for analysis

### 📡 **API Usage**

```javascript
// Get current metrics
const response = await fetch('/api/metrics')
const metrics = await response.json()

// Run benchmark test
const benchmark = await fetch('/api/benchmark', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    testType: 'erc20',
    parameters: { txCount: 1000, batchSize: 50 }
  })
})
```

## 🛠️ **Tech Stack**

| Category | Technology | Purpose |
|----------|------------|---------|
| **Frontend** | Next.js 14 + TypeScript | React framework with SSR/SSG |
| **Styling** | TailwindCSS + Framer Motion | Utility-first CSS + animations |
| **Charts** | Recharts | Interactive data visualizations |
| **Blockchain** | ethers.js | Ethereum/Monad network interaction |
| **Backend** | Next.js API Routes | Serverless API endpoints |
| **Database** | In-memory (upgradeable) | Data persistence layer |
| **Smart Contracts** | Foundry | Solidity development framework |

## 🌊 **Monad Network Integration**

This project showcases **Monad's revolutionary performance** through:

- **Sub-second block times** with real-time monitoring
- **Thousands of TPS** capability demonstration  
- **EVM compatibility** with enhanced performance
- **Parallel execution** benefits visualization
- **Gas efficiency** comparative analysis

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md).

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📊 **Project Roadmap**

### ✅ **Phase 1: Foundation** (Completed)
- [x] Real-time dashboard with live metrics
- [x] Multi-RPC failover system
- [x] Interactive charts and visualizations
- [x] Live transaction feed
- [x] Basic benchmark framework

### 🔄 **Phase 2: Enhancement** (In Progress)
- [ ] Real Foundry integration
- [ ] Database persistence (PostgreSQL)
- [ ] Advanced analytics & insights
- [ ] Export & reporting features
- [ ] API documentation

### 🔮 **Phase 3: Scale** (Planned)
- [ ] Multi-network comparison
- [ ] AI-powered insights
- [ ] Enterprise dashboard
- [ ] Custom alerting system
- [ ] Community features

## 📈 **Performance Metrics**

Current live tracking includes:
- **TPS**: Real-time transactions per second
- **Block Time**: Average block confirmation time  
- **Gas Prices**: Current network gas costs
- **Network Health**: Connection and sync status
- **Transaction Success Rate**: Network reliability metrics

## 🔒 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **Monad Labs** for the incredible blockchain technology
- **Next.js Team** for the amazing framework
- **Ethereum Community** for foundational tools
- **Open Source Contributors** for inspiration and tools

## 📞 **Support & Contact**

- 🐛 **Issues**: [GitHub Issues](https://github.com/Lesnak1/monad-performance-analytics/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/Lesnak1/monad-performance-analytics/discussions)
- 🐦 **Twitter**: [@Lesnak1](https://twitter.com/Lesnak1)

---

<div align="center">

**⭐ Star this repo if you find it useful! ⭐**

**Built with ❤️ for the Monad ecosystem**

</div> 