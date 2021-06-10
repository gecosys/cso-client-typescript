export abstract class IConnector {
  abstract listen(callback: (sender: string, data: Uint8Array) => number): void;
  abstract close(): void;
  abstract sendMessage(
    recvName: string,
    content: Uint8Array,
    isEncrypted: boolean,
    isCached: boolean
  ): Promise<number>;
  abstract sendGroupMessage(
    groupName: string,
    content: Uint8Array,
    isEncrypted: boolean,
    isCached: boolean
  ): Promise<number>;
  abstract sendMessageAndRetry(
    recvName: string,
    content: Uint8Array,
    isEncrypted: boolean,
    numberRetry: number
  ): number;
  abstract sendGroupMessageAndRetry(
    groupName: string,
    content: Uint8Array,
    isEncrypted: boolean,
    numberRetry: number
  ): number;
}
