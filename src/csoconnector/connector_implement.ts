import { IConfig } from "../config/config";
import { Connection } from "../csoconnection/conn_implement";
import { IConnection } from "../csoconnection/conn_interface";
import { Counter } from "../csocounter/counter_implement";
import { ICounter } from "../csocounter/counter_interface";
import { Parser } from "../csoparser/parser_implement";
import { IParser } from "../csoparser/parser_interface";
import { Proxy } from "../csoproxy/proxy_implement";
import { IProxy } from "../csoproxy/proxy_interface";
import { ServerTicket } from "../csoproxy/proxy_message";
import { ItemQueue } from "../csoqueue/queue_entity";
import { Queue } from "../csoqueue/queue_implement";
import { IQueue } from "../csoqueue/queue_interface";
import { MessageType } from "../messages/cipher/cipher";
import { ReadyTicket } from "../messages/readyticket/readyticket";
import { IConnector } from "./conn_interface";

export class Connector implements IConnector {
  isStopped: boolean = false;
  isRunning: boolean = false;
  isActivated: boolean = false;
  counter: ICounter;
  conn: IConnection;
  queueMessages: IQueue;
  parser: IParser;
  proxy: IProxy;

  //??? bufferSize
  constructor(
    bufferSize?: number,
    queue?: Queue,
    parser?: IParser,
    proxy?: Proxy
  ) {
    this.counter = null;
    this.conn = new Connection();
    this.queueMessages = queue;
    this.parser = parser;
    this.proxy = proxy;
  }

  initDefault(bufferSize: number, conf: IConfig): void {
    this.counter = null;
    this.conn = new Connection();
    this.queueMessages = new Queue(bufferSize);
    this.parser = new Parser();
    this.proxy = new Proxy(conf);
  }

  async close(): Promise<void> {
    if (this.isStopped) {
      return;
    }
    this.isStopped = true;
    await this.conn.close();
  }

  listen(callback: (sender: string, data: Uint8Array) => number): void {
    if (this.isRunning) {
      return;
    }
    this.isRunning = true;
    this.loopReconnect(callback);
    this.loopRetrySendMessage();
  }

  async sendMessage(
    recvName: string,
    content: Uint8Array,
    isEncrypted: boolean,
    isCached: boolean
  ): Promise<number> {
    if (this.isActivated === false || this.isStopped) {
      return null;
    }

    let msg = this.parser.BuildMessage(
      BigInt(0),
      BigInt(0),
      recvName,
      content,
      isEncrypted,
      isCached,
      true,
      true,
      true
    );

    if (msg === null) {
      return null;
    }
    return await this.conn.sendMessage(msg);
  }

  async sendGroupMessage(
    groupName: string,
    content: Uint8Array,
    isEncrypted: boolean,
    isCached: boolean
  ): Promise<number> {
    if (this.isActivated === false || this.isStopped) {
      return null;
    }

    let msg = this.parser.BuildGroupMessage(
      BigInt(0),
      BigInt(0),
      groupName,
      content,
      isEncrypted,
      isCached,
      true,
      true,
      true
    );

    if (msg === null) {
      return null;
    }

    return await this.conn.sendMessage(msg);
  }

  sendMessageAndRetry(
    recvName: string,
    content: Uint8Array,
    isEncrypted: boolean,
    numberRetry: number
  ): number {
    if (this.isActivated == false || this.isStopped) {
      return null;
    }

    let isSuccess = this.queueMessages.pushMessage(
      new ItemQueue(
        BigInt(this.counter?.nextWriteIndex() ?? 0),
        BigInt(0),
        recvName,
        content,
        isEncrypted,
        false,
        true,
        true,
        true,
        false,
        numberRetry + 1,
        BigInt(0)
      )
    );

    return isSuccess ? 1 : null;
  }

  sendGroupMessageAndRetry(
    groupName: string,
    content: Uint8Array,
    isEncrypted: boolean,
    numberRetry: number
  ): number {
    if (this.isActivated === false || this.isStopped) {
      return null;
    }
    let isSuccess = this.queueMessages.pushMessage(
      new ItemQueue(
        BigInt(this.counter?.nextWriteIndex() ?? 0),
        BigInt(0),
        groupName,
        content,
        isEncrypted,
        false,
        true,
        true,
        true,
        true,
        numberRetry + 1,
        BigInt(0)
      )
    );
    return isSuccess ? 1 : null;
  }

  loopReconnect(callback: (sender: string, data: Uint8Array) => number): void {
    Connector.sleep(1000).then(async () => {
      if (this.isStopped) {
        return;
      }
      let serverTicket = await this.prepare();
      if (serverTicket === null) {
        this.loopReconnect(callback);
        return;
      }

      var isDisconnected = [false]; // use list to use reference
      this.isActivated = false;
      this.loopActivateConnection(
        isDisconnected,
        serverTicket.ticketID,
        serverTicket.ticketBytes
      );

      // Connect to Cloud Socket system
      this.parser.setSecretKey(serverTicket.serverSecretKey);
      this.conn.listen(
        serverTicket.hubAddress,
        (msg: Uint8Array) => {
          this.processMessage(msg, callback);
        },
        () => {
          isDisconnected[0] = true;
          this.loopReconnect(callback);
        }
      );
    });
  }

  loopActivateConnection(
    isDisconnected: boolean[],
    ticketID: number,
    ticketBytes: Uint8Array
  ): void {
    Connector.sleep(1000).then(async () => {
      if (isDisconnected[0] || this.isActivated || this.isStopped) {
        return;
      }
      await this.activateConnection(ticketID, ticketBytes);
      this.loopActivateConnection(isDisconnected, ticketID, ticketBytes);
    });
  }

  loopRetrySendMessage(): void {
    Connector.sleep(1000).then(async () => {
      if (this.isStopped) {
        return;
      }
      let itemQueue = this.queueMessages.nextMessage()
        ? this.queueMessages.nextMessage()
        : null;
      if (itemQueue === null) {
        this.loopRetrySendMessage();
        return;
      }
      let content;
      if (itemQueue.isGroup) {
        content = this.parser.BuildGroupMessage(
          itemQueue.msgID,
          itemQueue.msgTag,
          itemQueue.recvName,
          itemQueue.content,
          itemQueue.isEncrypted,
          itemQueue.isCached,
          itemQueue.isFirst,
          itemQueue.isLast,
          itemQueue.isRequest
        );
      } else {
        content = this.parser.BuildMessage(
          itemQueue.msgID,
          itemQueue.msgTag,
          itemQueue.recvName,
          itemQueue.content,
          itemQueue.isEncrypted,
          itemQueue.isCached,
          itemQueue.isFirst,
          itemQueue.isLast,
          itemQueue.isRequest
        );
      }
      if (content === null) {
        this.conn.sendMessage(content);
      }
      this.loopRetrySendMessage();
    });
  }

  async prepare() {
    let serverKey = await this.proxy.exchangeKey();
    if (serverKey === null) {
      return new ServerTicket();
    }
    return this.proxy.registerConnection(serverKey);
  }

  async activateConnection(
    ticketID: number,
    ticketBytes: Uint8Array
  ): Promise<number> {
    let msg = this.parser.BuildActivateMessage(ticketID, ticketBytes);

    if (msg === null) {
      return null;
    }
    return this.conn.sendMessage(msg);
  }

  async sendResponse(
    msgID: bigint,
    msgTag: bigint,
    recvName: string,
    data: Uint8Array,
    isEncrypted: boolean
  ): Promise<number> {
    let msg = this.parser.BuildMessage(
      msgID,
      msgTag,
      recvName,
      data,
      isEncrypted,
      false,
      true,
      true,
      false
    );
    if (msg === null) {
      return null;
    }
    return await this.conn.sendMessage(msg);
  }

  async processMessage(
    content: Uint8Array,
    callback: (sender: string, data: Uint8Array) => number
  ) {
    let msg = this.parser.ParseReceivedMessage(content);
    if (msg === null) {
      return;
    }

    let msgType = msg.MessageType;

    if (msgType == MessageType.TypeActivation) {
      let readyTicket = new ReadyTicket();
      readyTicket.ParseBytes(msg.Data);

      if (readyTicket === null || !readyTicket.IsReady) {
        return;
      }
      this.isActivated = true;

      if (this.counter == null) {
        this.counter = new Counter(
          readyTicket.IdxWrite,
          readyTicket.IdxRead,
          readyTicket.MaskRead
        );
      }
      return;
    }

    if (this.isActivated == false) {
      return;
    }

    if (
      msgType != MessageType.TypeDone &&
      msgType != MessageType.TypeSingle &&
      msgType != MessageType.TypeSingleCached
    ) {
      if (
        msgType != MessageType.TypeGroup &&
        msgType != MessageType.TypeGroupCached
      ) {
        return;
      }
    }

    if (msg.MessageID == BigInt(0)) {
      if (msg.IsRequest) {
        callback(msg.Name, msg.Data);
      }
      return;
    }

    if (msg.IsRequest === false) {
      // response
      this.queueMessages.clearMessage(msg.MessageID);
      return;
    }

    if (this.counter?.markReadDone(msg.MessageTag) ?? false) {
      let errCode = callback(msg.Name, msg.Data);
      if (errCode === null) {
        this.counter?.markReadUnused(msg.MessageTag);
        return;
      }
    }

    this.sendResponse(
      msg.MessageID,
      msg.MessageTag,
      msg.Name,
      new Uint8Array(0),
      msg.IsEncrypted
    );
  }

  static sleep(time: number) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }
}
