// Simple Express server with Envio HyperRPC
const express = require('express');
const { ethers } = require('ethers');
const cors = require('cors');

const app = express();
const PORT = 8000;

// Enable CORS
app.use(cors());
app.use(express.json());

// Envio HyperRPC providers
const providers = [
  new ethers.JsonRpcProvider('https://monad-testnet.rpc.hypersync.xyz'),
  new ethers.JsonRpcProvider('https://10143.rpc.hypersync.xyz')
];

let currentProvider = 0;

async function getProvider() {
  try {
    const provider = providers[currentProvider];
    await provider.getBlockNumber(); // Test connection
    return provider;
  } catch (error) {
    console.log(`❌ Provider ${currentProvider} failed, switching...`);
    currentProvider = (currentProvider + 1) % providers.length;
    return providers[currentProvider];
  }
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Monad Analytics with Envio HyperRPC',
    timestamp: new Date().toISOString()
  });
});

// Real-time metrics endpoint
app.get('/api/metrics', async (req, res) => {
  try {
    const provider = await getProvider();
    const start = Date.now();
    
    // Get real blockchain data
    const [blockNumber, gasPrice, latestBlock] = await Promise.all([
      provider.getBlockNumber(),
      provider.getFeeData(),
      provider.getBlock('latest', true)
    ]);
    
    const responseTime = Date.now() - start;
    const transactionCount = latestBlock?.transactions?.length || 0;
    
    // Calculate TPS (approximate)
    const blockTime = 0.6; // Monad's ~600ms block time
    const tps = Math.round(transactionCount / blockTime);
    
    const metrics = {
      success: true,
      data: {
        blockNumber,
        gasPrice: ethers.formatUnits(gasPrice.gasPrice || 0, 'gwei'),
        tps,
        transactionCount,
        blockTime,
        blockHash: latestBlock?.hash,
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        rpcProvider: `Envio HyperRPC (Provider ${currentProvider + 1})`
      }
    };
    
    console.log(`📊 Metrics delivered in ${responseTime}ms - Block: ${blockNumber}, TPS: ${tps}`);
    res.json(metrics);
    
  } catch (error) {
    console.error('❌ Error fetching metrics:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Latest transactions endpoint
app.get('/api/transactions', async (req, res) => {
  try {
    const provider = await getProvider();
    const start = Date.now();
    
    const latestBlock = await provider.getBlock('latest', true);
    const responseTime = Date.now() - start;
    
    if (!latestBlock || !latestBlock.transactions) {
      return res.json({
        success: true,
        data: [],
        message: 'No transactions in latest block'
      });
    }
    
    // Get transaction details (limit to 10 for performance)
    const txHashes = latestBlock.transactions.slice(0, 10);
    const transactions = [];
    
    for (const txHash of txHashes) {
      try {
        const tx = await provider.getTransaction(txHash);
        if (tx) {
          transactions.push({
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            value: ethers.formatEther(tx.value || 0),
            gasPrice: ethers.formatUnits(tx.gasPrice || 0, 'gwei'),
            blockNumber: tx.blockNumber
          });
        }
      } catch (txError) {
        console.warn(`⚠️ Failed to get tx ${txHash}:`, txError.message);
      }
    }
    
    console.log(`📋 ${transactions.length} transactions delivered in ${responseTime}ms`);
    res.json({
      success: true,
      data: transactions,
      blockNumber: latestBlock.number,
      totalTransactions: latestBlock.transactions.length,
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching transactions:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Monad Analytics Server running on port ${PORT}`);
  console.log(`🔗 Using Envio HyperRPC endpoints:`);
  console.log(`   • https://monad-testnet.rpc.hypersync.xyz`);
  console.log(`   • https://10143.rpc.hypersync.xyz`);
  console.log(`📡 API Endpoints:`);
  console.log(`   • GET /health - Health check`);
  console.log(`   • GET /api/metrics - Real-time blockchain metrics`);
  console.log(`   • GET /api/transactions - Latest transactions\n`);
}); 