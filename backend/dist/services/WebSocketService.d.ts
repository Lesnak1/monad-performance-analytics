import { Server as SocketIOServer } from 'socket.io';
import { MetricsCollector } from './MetricsCollector';
export interface SocketUser {
    id: string;
    socket: any;
    subscriptions: string[];
    joinedAt: Date;
}
export declare class WebSocketService {
    private io;
    private metricsCollector;
    private connectedUsers;
    private broadcastIntervals;
    private roomStats;
    constructor(io: SocketIOServer, metricsCollector: MetricsCollector);
    initialize(): void;
    private setupSocketHandlers;
    private sendInitialData;
    private handleSubscription;
    private handleUnsubscription;
    private handleRequest;
    private sendSubscriptionData;
    private handleDisconnection;
    private setupBroadcastIntervals;
    private broadcastToSubscribers;
    private setupAlertListeners;
    private broadcastAlert;
    private broadcastConnectionStats;
    private getConnectionStats;
    broadcastMessage(event: string, data: any): void;
    broadcastToRoom(room: string, event: string, data: any): void;
    getConnectedUsersCount(): number;
    getSubscriptionStats(): Record<string, number>;
    cleanup(): void;
}
//# sourceMappingURL=WebSocketService.d.ts.map