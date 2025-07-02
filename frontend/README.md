# Monad Performance Analytics Suite (MPAS)

🚀 **Real-time performance analytics platform for Monad blockchain** - Vercel optimized

## 🌟 Features

- **Real-time Monad Testnet Data**: Live TPS, gas prices, block times from Chain ID 10143
- **Advanced Analytics**: Interactive charts and performance insights
- **Live Transaction Feed**: Real transactions from Monad testnet
- **Network Health Monitoring**: Multi-RPC endpoint management
- **Benchmark Tools**: Performance testing capabilities
- **Export Functionality**: Data export in multiple formats
- **Responsive Design**: Optimized for all devices

## 🔧 Vercel Deployment

### Automatic Deployment
1. Connect your GitHub repository to Vercel
2. Set root directory to `frontend`
3. Use these build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### Environment Variables
```env
NEXT_PUBLIC_MONAD_RPC_URL=https://monad-testnet.rpc.hypersync.xyz
NEXT_PUBLIC_CHAIN_ID=41454
NEXT_PUBLIC_TESTNET_CHAIN_ID=10143
NODE_ENV=production
```

### Manual Deployment
```bash
# Clone and navigate
git clone <repository-url>
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm start
```

## 🏗️ Development

```bash
# Development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📊 API Endpoints

All APIs are optimized for Vercel serverless functions:

- `GET /api/metrics` - Core blockchain metrics
- `GET /api/monad-metrics` - Enhanced Monad data
- `GET /api/network-status` - Network connectivity
- `GET /api/transactions` - Live transaction feed
- `GET /api/benchmark` - Performance benchmarks

## 🔗 Live Data Sources

- **Official Monad RPC**: testnet-rpc.monad.xyz
- **Envio HyperRPC**: monad-testnet.rpc.hypersync.xyz
- **Thirdweb**: 10143.rpc.thirdweb.com
- **DRPC**: monad-testnet.drpc.org

## 🚀 Performance

- **Build Size**: ~235KB First Load JS
- **Static Pages**: Pre-rendered for optimal performance
- **API Functions**: Serverless with 25s timeout
- **Caching**: Intelligent data caching (2-5s intervals)
- **RPC Management**: Automatic failover between providers

## 📱 Responsive Design

- **Mobile-first**: Optimized for mobile devices
- **Tablet Support**: Enhanced tablet experience
- **Desktop**: Full-featured desktop interface
- **PWA Ready**: Progressive Web App capabilities

## 🔧 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Blockchain**: Ethers.js v6
- **Charts**: Recharts
- **Deployment**: Vercel (optimized)

## 📈 Real-time Features

- **TPS Monitoring**: Live transactions per second
- **Gas Price Tracking**: Real-time gas prices in Gwei
- **Block Time Analysis**: Sub-second block confirmations
- **Network Health**: Multi-point health monitoring
- **Transaction Stream**: Live transaction feed

## 🌐 Browser Support

- Chrome 90+
- Firefox 90+
- Safari 14+
- Edge 90+

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes in `frontend/` directory
4. Test with `npm run build`
5. Submit pull request

---

**Built for Monad Ecosystem** 🟣 | **Powered by Vercel** ⚡ 