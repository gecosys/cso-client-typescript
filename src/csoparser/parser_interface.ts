import { Cipher } from "../messages/cipher/cipher";

export abstract class IParser {
  abstract setSecretKey(secretKey: Uint8Array): void;
  abstract ParseReceivedMessage(content: Uint8Array): Cipher;
  abstract BuildActivateMessage(
    ticketID: Uint32Array[1],
    ticketBytes: Uint8Array
  ): Uint8Array;
  abstract BuildMessage(
    msgID: bigint,
    msgTag: bigint,
    recvName: string,
    content: Uint8Array,
    encrypted: boolean,
    cached: boolean,
    first: boolean,
    last: boolean,
    request: boolean
  ): Uint8Array;
  abstract BuildGroupMessage(
    msgID: bigint,
    msgTag: bigint,
    groupName: string,
    content: Uint8Array,
    encrypted: boolean,
    cached: boolean,
    first: boolean,
    last: boolean,
    request: boolean
  ): Uint8Array;
}
