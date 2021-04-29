export class ReadyTicket {
  IsReady: boolean;
  IdxRead: bigint;
  MaskRead: number;
  IdxWrite: bigint;

  constructor() {}

  // ParseBytes converts bytes to ReadyTicket
  // Flag is_ready: 1 byte
  // Idx Read: 8 bytes
  // Mark Read: 4 bytes
  // Idx Write: 8 bytes

  public ParseBytes(buffer: Uint8Array) {
    if (buffer.byteLength != 21) {
      return null;
    }

    const idxRead =
      (BigInt(buffer[8]) << BigInt(56)) |
      (BigInt(buffer[7]) << BigInt(48)) |
      (BigInt(buffer[6]) << BigInt(40)) |
      (BigInt(buffer[5]) << BigInt(32)) |
      (BigInt(buffer[4]) << BigInt(24)) |
      (BigInt(buffer[3]) << BigInt(16)) |
      (BigInt(buffer[2]) << BigInt(8)) |
      BigInt(buffer[1]);

    const maskRead = Number(
      (BigInt(buffer[12]) << BigInt(24)) |
        (BigInt(buffer[11]) << BigInt(16)) |
        (BigInt(buffer[10]) << BigInt(8)) |
        BigInt(buffer[9])
    );

    const idxWrite =
      (BigInt(buffer[20]) << BigInt(56)) |
      (BigInt(buffer[19]) << BigInt(48)) |
      (BigInt(buffer[18]) << BigInt(40)) |
      (BigInt(buffer[17]) << BigInt(32)) |
      (BigInt(buffer[16]) << BigInt(24)) |
      (BigInt(buffer[15]) << BigInt(16)) |
      (BigInt(buffer[14]) << BigInt(8)) |
      BigInt(buffer[13]);

    this.IsReady = buffer[0] == 1;
    this.IdxRead = idxRead;
    this.MaskRead = maskRead;
    this.IdxWrite = idxWrite;
  }
}
