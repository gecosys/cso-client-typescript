export class ItemQueue {
  msgID: bigint;
  msgTag: bigint;
  recvName: string;
  content: number[];
  isEncrypted: boolean;
  isCached: boolean;
  isFirst: boolean;
  isLast: boolean;
  isRequest: boolean;
  isGroup: boolean;
  numberRetry: number;
  timestamp: bigint;

  constructor(
    msgID: bigint,
    msgTag: bigint,
    recvName: string,
    content: number[],
    isEncrypted: boolean,
    isCached: boolean,
    isFirst: boolean,
    isLast: boolean,
    isRequest: boolean,
    isGroup: boolean,
    numberRetry: number,
    timestamp: bigint
  ) {
    this.msgID = msgID;
    this.msgTag = msgTag;
    this.recvName = recvName;
    this.content = content;
    this.isEncrypted = isEncrypted;
    this.isCached = isCached;
    this.isFirst = isFirst;
    this.isLast = isLast;
    this.isRequest = isRequest;
    this.isGroup = isGroup;
    this.numberRetry = numberRetry;
    this.timestamp = timestamp;
  }

  setNumberRetry(numberRetry: number) {
    this.numberRetry = numberRetry;
  }

  setTimestamp(timestamp: bigint) {
    this.timestamp = timestamp;
  }

  getMsgID() {
    return BigInt(this.msgID);
  }

  getMsgTag() {
    return BigInt(this.msgTag);
  }

  getRecvName() {
    return this.recvName;
  }

  getContent() {
    return this.content;
  }

  getIsEncrypted() {
    return this.isEncrypted;
  }

  getIsCached() {
    return this.isCached;
  }

  getIsFirst() {
    return this.isFirst;
  }

  getIsLast() {
    return this.isLast;
  }

  getIsRequest() {
    return this.isRequest;
  }

  getIsGroup() {
    return this.isGroup;
  }

  getNumberRetry() {
    return this.numberRetry;
  }

  getTimestamp() {
    return BigInt(this.timestamp);
  }
}
