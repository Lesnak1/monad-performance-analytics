export interface NetworkMetrics {
    blockNumber: number;
    gasPrice: string;
    tps: number;
    blockTime: number;
    networkHealth: number;
    totalTransactions: number;
    timestamp: Date;
}
export interface Transaction {
    hash: string;
    from: string;
    to: string | null;
    value: string;
    gasPrice: string;
    gasUsed: string;
    gasLimit: string;
    blockNumber: number;
    blockHash: string;
    timestamp: Date;
    status: 'success' | 'failed' | 'pending';
    type: 'transfer' | 'contract' | 'swap' | 'mint' | 'burn' | 'bridge';
}
export interface Block {
    number: number;
    hash: string;
    parentHash: string;
    timestamp: Date;
    gasUsed: string;
    gasLimit: string;
    transactionCount: number;
    transactions: string[];
    difficulty: string;
    totalDifficulty: string;
}
export declare class MonadRPCService {
    private static instance;
    private provider;
    private fallbackProvider;
    private wsProvider;
    private isConnected;
    private reconnectAttempts;
    private maxReconnectAttempts;
    private currentBlockNumber;
    private transactionPool;
    private metricsHistory;
    private constructor();
    static getInstance(): MonadRPCService;
    initialize(): Promise<void>;
    private testConnection;
    private initializeWebSocket;
    private reconnectWebSocket;
    private setupBlockListener;
    private handleNewBlock;
    private calculateNetworkMetrics;
    private calculateTPS;
    private calculateBlockTime;
    private calculateNetworkHealth;
    private formatTransaction;
    private determineTransactionType;
    getCurrentMetrics(): NetworkMetrics | null;
    getRecentTransactions(limit?: number): Transaction[];
    getMetricsHistory(limit?: number): NetworkMetrics[];
    getBlockByNumber(blockNumber: number): Promise<Block | null>;
    getTransactionByHash(hash: string): Promise<Transaction | null>;
    isServiceConnected(): boolean;
}
//# sourceMappingURL=MonadRPCService.d.ts.map