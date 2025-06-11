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
    to: string;
    value: string;
    gasPrice: string;
    gasUsed: number;
    status: 'pending' | 'confirmed' | 'failed';
    timestamp: number;
    blockNumber: number;
    type: 'transfer' | 'contract' | 'mint' | 'swap';
}
export declare class MonadRPCService {
    private static instance;
    private providers;
    private currentProviderIndex;
    private connected;
    private metricsHistory;
    private transactionHistory;
    private currentMetrics;
    private readonly RPC_ENDPOINTS;
    private readonly CHAIN_ID;
    private readonly CHAIN_NAME;
    private readonly NATIVE_TOKEN;
    private readonly BLOCK_EXPLORERS;
    private constructor();
    static getInstance(): MonadRPCService;
    private initializeProviders;
    connect(): Promise<void>;
    private connectToProvider;
    private collectInitialData;
    private fetchRealTimeMetrics;
    private fetchFromSocialScan;
    private calculateNetworkHealth;
    private fetchRecentTransactions;
    private determineTransactionType;
    private switchProvider;
    private startMetricsCollection;
    private addMetricsToHistory;
    isServiceConnected(): boolean;
    getCurrentMetrics(): NetworkMetrics | null;
    getMetricsHistory(limit?: number): NetworkMetrics[];
    getRecentTransactions(limit?: number): Transaction[];
    getNetworkInfo(): {
        chainId: number;
        chainName: string;
        nativeToken: string;
        rpcEndpoints: string[];
        blockExplorers: string[];
        currentRpc: string;
        connected: boolean;
    };
    disconnect(): Promise<void>;
}
//# sourceMappingURL=MonadRPCService.d.ts.map