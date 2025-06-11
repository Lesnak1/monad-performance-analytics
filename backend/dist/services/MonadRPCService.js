"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonadRPCService = void 0;
const ethers_1 = require("ethers");
const ws_1 = __importDefault(require("ws"));
const logger_1 = __importDefault(require("../utils/logger"));
class MonadRPCService {
    constructor() {
        this.wsProvider = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.currentBlockNumber = 0;
        this.transactionPool = [];
        this.metricsHistory = [];
        const rpcUrl = process.env.MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz';
        const fallbackUrl = process.env.MONAD_RPC_FALLBACK || 'https://monad-testnet.rpc.caldera.xyz/http';
        this.provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
        this.fallbackProvider = new ethers_1.ethers.JsonRpcProvider(fallbackUrl);
    }
    static getInstance() {
        if (!MonadRPCService.instance) {
            MonadRPCService.instance = new MonadRPCService();
        }
        return MonadRPCService.instance;
    }
    async initialize() {
        try {
            await this.testConnection();
            await this.initializeWebSocket();
            this.setupBlockListener();
            this.isConnected = true;
            logger_1.default.info('✅ Monad RPC Service initialized successfully');
        }
        catch (error) {
            logger_1.default.error('❌ Failed to initialize Monad RPC Service:', error);
            throw error;
        }
    }
    async testConnection() {
        try {
            const network = await this.provider.getNetwork();
            const blockNumber = await this.provider.getBlockNumber();
            logger_1.default.info('🔗 Connected to Monad network:', {
                chainId: network.chainId.toString(),
                name: network.name,
                currentBlock: blockNumber
            });
            this.currentBlockNumber = blockNumber;
        }
        catch (error) {
            logger_1.default.warn('Primary RPC failed, trying fallback...');
            try {
                const network = await this.fallbackProvider.getNetwork();
                const blockNumber = await this.fallbackProvider.getBlockNumber();
                this.provider = this.fallbackProvider;
                this.currentBlockNumber = blockNumber;
                logger_1.default.info('✅ Connected to Monad network via fallback:', {
                    chainId: network.chainId.toString(),
                    currentBlock: blockNumber
                });
            }
            catch (fallbackError) {
                throw new Error('Both primary and fallback RPC endpoints failed');
            }
        }
    }
    async initializeWebSocket() {
        try {
            const wsUrl = process.env.MONAD_WSS_URL || 'wss://testnet-rpc.monad.xyz';
            this.wsProvider = new ws_1.default(wsUrl);
            this.wsProvider.on('open', () => {
                logger_1.default.info('✅ WebSocket connection established');
                this.reconnectAttempts = 0;
                this.wsProvider?.send(JSON.stringify({
                    id: 1,
                    method: 'eth_subscribe',
                    params: ['newHeads']
                }));
            });
            this.wsProvider.on('message', (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    if (message.method === 'eth_subscription') {
                        this.handleNewBlock(message.params.result);
                    }
                }
                catch (error) {
                    logger_1.default.error('Error parsing WebSocket message:', error);
                }
            });
            this.wsProvider.on('close', () => {
                logger_1.default.warn('WebSocket connection closed');
                this.reconnectWebSocket();
            });
            this.wsProvider.on('error', (error) => {
                logger_1.default.error('WebSocket error:', error);
                this.reconnectWebSocket();
            });
        }
        catch (error) {
            logger_1.default.warn('WebSocket initialization failed, continuing with polling:', error);
        }
    }
    reconnectWebSocket() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            logger_1.default.error('Max WebSocket reconnection attempts reached');
            return;
        }
        this.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
        logger_1.default.info(`Attempting WebSocket reconnection in ${delay}ms (attempt ${this.reconnectAttempts})`);
        setTimeout(() => {
            this.initializeWebSocket();
        }, delay);
    }
    setupBlockListener() {
        setInterval(async () => {
            try {
                const latestBlock = await this.provider.getBlockNumber();
                if (latestBlock > this.currentBlockNumber) {
                    const block = await this.provider.getBlock(latestBlock, true);
                    if (block) {
                        this.handleNewBlock({
                            number: `0x${block.number.toString(16)}`,
                            hash: block.hash,
                            timestamp: `0x${block.timestamp.toString(16)}`
                        });
                    }
                }
            }
            catch (error) {
                logger_1.default.error('Error in block polling:', error);
            }
        }, 5000);
    }
    async handleNewBlock(blockHeader) {
        try {
            const blockNumber = parseInt(blockHeader.number, 16);
            if (blockNumber <= this.currentBlockNumber)
                return;
            const block = await this.provider.getBlock(blockNumber, true);
            if (!block)
                return;
            this.currentBlockNumber = blockNumber;
            const metrics = await this.calculateNetworkMetrics(block);
            this.metricsHistory.push(metrics);
            if (this.metricsHistory.length > 1000) {
                this.metricsHistory = this.metricsHistory.slice(-1000);
            }
            if (block.transactions) {
                for (const txHash of block.transactions.slice(0, 10)) {
                    try {
                        const tx = await this.provider.getTransaction(txHash);
                        const receipt = await this.provider.getTransactionReceipt(txHash);
                        if (tx && receipt) {
                            const transaction = this.formatTransaction(tx, receipt, block);
                            this.transactionPool.unshift(transaction);
                            if (this.transactionPool.length > 100) {
                                this.transactionPool = this.transactionPool.slice(0, 100);
                            }
                        }
                    }
                    catch (error) {
                        logger_1.default.error(`Error processing transaction ${txHash}:`, error);
                    }
                }
            }
            logger_1.default.logBlockchainEvent('NewBlock', {
                blockNumber,
                transactionCount: block.transactions?.length || 0,
                gasUsed: block.gasUsed.toString(),
                timestamp: new Date(block.timestamp * 1000)
            });
        }
        catch (error) {
            logger_1.default.error('Error handling new block:', error);
        }
    }
    async calculateNetworkMetrics(block) {
        try {
            const gasPrice = await this.provider.getFeeData();
            const tps = await this.calculateTPS();
            const blockTime = await this.calculateBlockTime();
            const networkHealth = this.calculateNetworkHealth(block, tps, blockTime);
            return {
                blockNumber: block.number,
                gasPrice: gasPrice.gasPrice?.toString() || '0',
                tps,
                blockTime,
                networkHealth,
                totalTransactions: this.transactionPool.length,
                timestamp: new Date()
            };
        }
        catch (error) {
            logger_1.default.error('Error calculating network metrics:', error);
            return {
                blockNumber: block.number,
                gasPrice: '0',
                tps: 0,
                blockTime: 0,
                networkHealth: 0,
                totalTransactions: 0,
                timestamp: new Date()
            };
        }
    }
    async calculateTPS() {
        try {
            if (this.metricsHistory.length < 2)
                return 0;
            const recent = this.metricsHistory.slice(-10);
            const totalTransactions = recent.reduce((sum, metric) => sum + metric.totalTransactions, 0);
            const timeSpan = (recent[recent.length - 1].timestamp.getTime() - recent[0].timestamp.getTime()) / 1000;
            return timeSpan > 0 ? totalTransactions / timeSpan : 0;
        }
        catch (error) {
            return 0;
        }
    }
    async calculateBlockTime() {
        try {
            if (this.metricsHistory.length < 2)
                return 0;
            const recent = this.metricsHistory.slice(-5);
            if (recent.length < 2)
                return 0;
            const totalTime = recent[recent.length - 1].timestamp.getTime() - recent[0].timestamp.getTime();
            const averageBlockTime = totalTime / (recent.length - 1) / 1000;
            return averageBlockTime;
        }
        catch (error) {
            return 0;
        }
    }
    calculateNetworkHealth(block, tps, blockTime) {
        let health = 100;
        if (tps < 10)
            health -= 20;
        else if (tps < 50)
            health -= 10;
        if (blockTime > 10)
            health -= 20;
        else if (blockTime > 5)
            health -= 10;
        const gasUsagePercent = Number(block.gasUsed) / Number(block.gasLimit) * 100;
        if (gasUsagePercent > 90)
            health -= 15;
        else if (gasUsagePercent > 70)
            health -= 10;
        return Math.max(0, health);
    }
    formatTransaction(tx, receipt, block) {
        return {
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            value: tx.value.toString(),
            gasPrice: tx.gasPrice?.toString() || '0',
            gasUsed: receipt.gasUsed.toString(),
            gasLimit: tx.gasLimit.toString(),
            blockNumber: block.number,
            blockHash: block.hash,
            timestamp: new Date(block.timestamp * 1000),
            status: receipt.status === 1 ? 'success' : 'failed',
            type: this.determineTransactionType(tx, receipt)
        };
    }
    determineTransactionType(tx, receipt) {
        if (tx.to === null)
            return 'contract';
        if (tx.data && tx.data !== '0x')
            return 'contract';
        if (tx.value && tx.value.toString() !== '0')
            return 'transfer';
        return 'transfer';
    }
    getCurrentMetrics() {
        return this.metricsHistory.length > 0 ? this.metricsHistory[this.metricsHistory.length - 1] : null;
    }
    getRecentTransactions(limit = 20) {
        return this.transactionPool.slice(0, limit);
    }
    getMetricsHistory(limit = 100) {
        return this.metricsHistory.slice(-limit);
    }
    async getBlockByNumber(blockNumber) {
        try {
            const block = await this.provider.getBlock(blockNumber, true);
            if (!block)
                return null;
            const formattedBlock = {
                number: block.number,
                hash: block.hash || '',
                parentHash: block.parentHash,
                timestamp: new Date(block.timestamp * 1000),
                gasUsed: block.gasUsed?.toString() || '0',
                gasLimit: block.gasLimit?.toString() || '0',
                baseFeePerGas: block.baseFeePerGas?.toString() || '0',
                difficulty: block.difficulty?.toString() || '0',
                totalDifficulty: '0',
                miner: block.miner || '',
                transactions: [...(block.transactions || [])],
                transactionCount: block.transactions?.length || 0
            };
            return formattedBlock;
        }
        catch (error) {
            logger_1.default.error(`Error fetching block ${blockNumber}:`, error);
            return null;
        }
    }
    async getTransactionByHash(hash) {
        try {
            const tx = await this.provider.getTransaction(hash);
            const receipt = await this.provider.getTransactionReceipt(hash);
            if (!tx || !receipt)
                return null;
            const block = await this.provider.getBlock(tx.blockNumber);
            if (!block)
                return null;
            return this.formatTransaction(tx, receipt, block);
        }
        catch (error) {
            logger_1.default.error(`Error fetching transaction ${hash}:`, error);
            return null;
        }
    }
    isServiceConnected() {
        return this.isConnected;
    }
}
exports.MonadRPCService = MonadRPCService;
//# sourceMappingURL=MonadRPCService.js.map