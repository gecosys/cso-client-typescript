export abstract class IConnection {
  abstract close(): Promise<void>;
  abstract listen(address: string, onMessage, onDisconnected): void;
  abstract sendMessage(data: Uint8Array): number;
}
