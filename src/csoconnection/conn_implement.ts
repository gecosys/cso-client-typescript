import { IConnection } from "./conn_interface";
import { Status } from "./conn_status";
import * as net from "net";

export class Connection implements IConnection {
  // HeaderSize is size of header
  static headerSize = 2;
  // BufferSize is size of buffer or body
  static bufferSize = 1204;

  status = Status.StatusPrepare;
  clientSocket: net.Socket;

  async connect(address: string): Promise<number> {
    if (this.status != Status.StatusPrepare && this.clientSocket != null) {
      this.status = Status.StatusPrepare;
      this.clientSocket?.destroy();
    }

    this.status = Status.StatusConnecting;
    const str = address.split(":");
    if (str.length !== 2) {
      return null;
    }

    this.clientSocket = new net.Socket();

    this.clientSocket = net.createConnection(parseInt(str[1]), str[0], () => {
      console.log("Connected to server!");
    });

    this.status = Status.StatusConnected;
    return 1;
  }

  async close(): Promise<void> {
    await this.clientSocket.destroy();
  }

  //onMessages
  async listen(address: string, onMessage, onDisconnected) {
    let posBuffer = 0;
    let nextPosBuffer = 0;
    let lenHeader = 0;
    let lenBody = 0;
    let lenBuffer = 0;
    let lenMessage = 0;
    let header = new Uint8Array(Connection.headerSize);
    let body = new Uint8Array(Connection.bufferSize);

    let errorCode = await this.connect(address);
    if (errorCode === null) {
      return errorCode;
    }

    if (this.clientSocket === null) {
      return null;
    }

    this.clientSocket.on("data", (buffer: Buffer) => {
      console.log("Buffer:", new Uint8Array(buffer));
      posBuffer = 0;
      lenBuffer = buffer.length;
      while (posBuffer < lenBuffer) {
        if (lenMessage === 0) {
          nextPosBuffer = Math.min(
            posBuffer + Connection.headerSize - lenHeader,
            lenBuffer
          );
          header.set(buffer.slice(posBuffer, nextPosBuffer), lenHeader);
          lenHeader += nextPosBuffer - posBuffer;
          posBuffer = nextPosBuffer;
          if (lenHeader == Connection.headerSize) {
            lenMessage = (header[1] << 8) | header[0];
            lenBody = 0;
          }
          continue;
        }

        if (lenMessage <= 0 || lenMessage > Connection.bufferSize) {
          lenHeader = 0;
          lenMessage = 0;
          posBuffer += lenMessage;
          continue;
        }

        // Read body
        nextPosBuffer = Math.min(posBuffer + (lenMessage - lenBody), lenBuffer);
        body.set(buffer.slice(posBuffer, nextPosBuffer), lenBody);

        lenBody += nextPosBuffer - posBuffer;
        posBuffer = nextPosBuffer;

        if (lenBody !== lenMessage) {
          continue;
        }
        onMessage(body.slice(0, lenBody));
        lenMessage = 0;
        lenHeader = 0;
      }
    });

    this.clientSocket.on("error", (e) => {
      console.log(e);
    });

    this.clientSocket.on("end", () => {
      console.log("disconnected from server");
      this.status = Status.StatusDisconnected;
      onDisconnected();
    });

    return 1;
  }

  sendMessage(data: Uint8Array): number {
    if (this.status != Status.StatusConnected) {
      return null;
    }

    // Build formatted data
    let lenBytes = data.length;
    let lenBuffer = 2 + lenBytes;
    let buffer = new Uint8Array(lenBuffer);
    buffer[0] = lenBytes;
    buffer[1] = lenBytes;
    buffer[1] = buffer[1] >> 8;
    buffer.set(data, 2);

    console.log(buffer);

    // Send message
    this.clientSocket.push(buffer);

    // await _clientSocket?.flush();
    return 1;
  }
}
