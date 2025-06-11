// Vercel Serverless Function for Monad Transactions
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
    
    const latestBlock = await provider.getBlock('latest', true);
    const responseTime = Date.now() - start;
    
    if (!latestBlock || !latestBlock.transactions) {
      return res.status(200).json({
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
    res.status(200).json({
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
} 