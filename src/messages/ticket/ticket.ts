export class Ticket {
  ID: number;
  Token: Uint8Array;

  // ParseBytes converts bytes to Ticket
  // ID: 2 bytes
  // Token: next 32 bytes
  public ParseBytes(buffer: Uint8Array) {
    if (buffer.byteLength != 34) {
      return null;
    }
    let temp = new Uint16Array(1);
    temp[0] = (buffer[1] << 8) | buffer[0];

    this.ID = temp[0];
    this.Token = buffer.slice(2);
  }

  // BuildBytes returns bytes of Ticket
  public BuildBytes(id: Uint16Array[0], token: Uint8Array) {
    if (token.byteLength != 32) {
      return null;
    }

    let buffer = new Uint8Array(34);
    buffer[0] = id[0];
    buffer[1] = id[0] >> 8;
    for (let i = 0; i < 32; i++) {
      buffer[i + 2] = token[i];
    }
    return buffer;
  }
}
