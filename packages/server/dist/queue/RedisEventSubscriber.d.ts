import { SSEStreamer } from '../utils/SSEStreamer';
export declare class RedisEventSubscriber {
    private redisSubscriber;
    private sseStreamer;
    private subscribedChannels;
    constructor(sseStreamer: SSEStreamer);
    connect(): Promise<void>;
    subscribe(channel: string): void;
    private handleEvent;
    disconnect(): Promise<void>;
}
