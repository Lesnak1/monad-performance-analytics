// Simple test for Envio HyperRPC endpoints
const { ethers } = require('ethers');

async function testEnvioHyperRPC() {
  console.log('🔍 Testing Envio HyperRPC for Monad Testnet...\n');
  
  const endpoints = [
    'https://monad-testnet.rpc.hypersync.xyz',
    'https://10143.rpc.hypersync.xyz'
  ];

  for (let i = 0; i < endpoints.length; i++) {
    const endpoint = endpoints[i];
    console.log(`📡 Testing endpoint ${i + 1}: ${endpoint}`);
    
    try {
      const provider = new ethers.JsonRpcProvider(endpoint);
      
      const start = Date.now();
      const blockNumber = await provider.getBlockNumber();
      const duration = Date.now() - start;
      
      console.log(`✅ Success! Block: ${blockNumber}, Speed: ${duration}ms\n`);
      
      // Test a few more calls to measure speed
      const start2 = Date.now();
      const [gasPrice, latestBlock] = await Promise.all([
        provider.getFeeData(),
        provider.getBlock('latest')
      ]);
      const duration2 = Date.now() - start2;
      
      console.log(`📊 Additional data:`);
      console.log(`   Gas Price: ${ethers.formatUnits(gasPrice.gasPrice || 0, 'gwei')} Gwei`);
      console.log(`   Latest Block Hash: ${latestBlock?.hash}`);
      console.log(`   Query Speed: ${duration2}ms`);
      console.log(`   🚀 Total Speed: ${duration + duration2}ms\n`);
      
    } catch (error) {
      console.log(`❌ Failed: ${error.message}\n`);
    }
  }
}

testEnvioHyperRPC().catch(console.error); 