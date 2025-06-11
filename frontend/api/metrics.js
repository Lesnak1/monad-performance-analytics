// Vercel Serverless Function for Monad Metrics
const { ethers } = require('ethers');

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
    console.log(`Provider ${currentProvider} failed, switching...`);
    currentProvider = (currentProvider + 1) % providers.length;
    return providers[currentProvider];
  }
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
    res.status(200).json(metrics);
    
  } catch (error) {
    console.error('❌ Error fetching metrics:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
} 