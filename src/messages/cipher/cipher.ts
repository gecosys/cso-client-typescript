// MaxConnectionNameLength is max length of connections's name
const MaxConnectionNameLength = 36;

// MessageType is type of message (data) in Cipher
// let MessageType: Uint8Array[0];

export enum MessageType {
  // TypeActivation is type of activation message
  TypeActivation = 0x02,

  // TypeSingle is type of single message (message sent to another connection)
  TypeSingle = 0x03,

  // TypeGroup is type of group message (message sent to a group of connections)
  TypeGroup = 0x04,

  // TypeSingleCached is type of single message (message sent to another connection and cached on system)
  TypeSingleCached = 0x05,

  // TypeGroupCached is type of group message (message sent to a group of connections and cached on system)
  TypeGroupCached = 0x06,

  // TypeDone is type of done message
  TypeDone = 0x07,
}

// Cipher is encrypted message
export class Cipher {
  MessageID: bigint;
  MessageType: MessageType;
  MessageTag: bigint;
  IsFirst: boolean;
  IsLast: boolean;
  IsRequest: boolean;
  IsEncrypted: boolean;
  Name: string; // name of receiver or sender
  IV: Uint8Array;
  Data: Uint8Array;
  AuthenTag: Uint8Array;
  Sign: Uint8Array;

  // ParseBytes converts bytes to Cipher
  // ID of message: 8 bytes
  // Encrypted, First, Last, Request/Response, Tag, Type (3 bits): 1 byte
  // Length of Name (nName): 1 byte
  // Tag: if flag of tag = 1 then 8 bytes, otherwise 0 byte
  // AUTHEN_TAG: if encrypted is true then 16 bytes, otherwise 0 byte
  // IV: if encrypted is true then 12 bytes, otherwise 0 byte
  // Sign: if encrypted is false then 32 bytes (HMAC-SHA256), otherwise 0 byte
  // Name: nName bytes
  // Data: remaining bytes

  public ParseBytes(buffer: Uint8Array) {
    let fixedLen = 10;
    let posAuthenTag = 10;
    let lenBuffer = buffer.byteLength;
    if (lenBuffer < fixedLen) {
      return null;
    }

    let flag = buffer[8];
    let isEncrypted = (flag & 0x80) != 0;
    let msgID =
      (BigInt(buffer[7]) << BigInt(56)) |
      (BigInt(buffer[6]) << BigInt(48)) |
      (BigInt(buffer[5]) << BigInt(40)) |
      (BigInt(buffer[4]) << BigInt(32)) |
      (BigInt(buffer[3]) << BigInt(24)) |
      (BigInt(buffer[2]) << BigInt(16)) |
      (BigInt(buffer[1]) << BigInt(8)) |
      BigInt(buffer[0]);
    let lenName = Number(buffer[9]);
    let msgTag = BigInt(0);
    if ((flag & 0x08) != 0) {
      fixedLen += 8;
      posAuthenTag += 8;
      if (lenBuffer < fixedLen) {
        return null;
      }
      msgTag =
        (BigInt(buffer[17]) << BigInt(56)) |
        (BigInt(buffer[16]) << BigInt(48)) |
        (BigInt(buffer[15]) << BigInt(40)) |
        (BigInt(buffer[14]) << BigInt(32)) |
        (BigInt(buffer[13]) << BigInt(24)) |
        (BigInt(buffer[12]) << BigInt(16)) |
        (BigInt(buffer[11]) << BigInt(8)) |
        BigInt(buffer[10]);
    }

    if (isEncrypted) {
      fixedLen += 28; // authenTag (16) + iv (12)
    }
    if (
      lenBuffer < fixedLen + lenName ||
      lenName == 0 ||
      lenName > MaxConnectionNameLength
    ) {
      return null;
    }

    // Parse AUTHEN_TAG, IV
    let authenTag: Uint8Array;
    let iv: Uint8Array;
    let sign: Uint8Array;
    if (isEncrypted) {
      authenTag = new Uint8Array(16);
      iv = new Uint8Array(12);
      let posIV = posAuthenTag + 16;
      authenTag = buffer.slice(posAuthenTag, posIV);
      iv = buffer.slice(posIV, fixedLen);
    } else {
      let posSign = fixedLen;
      fixedLen += 32;
      if (lenBuffer < fixedLen + lenName) {
        return null;
      }
      sign = new Uint8Array(32);
      sign = buffer.slice(posSign, fixedLen);
    }
    // Parse name
    let posData = fixedLen + lenName;
    let name = "";
    if (lenName > 0) {
      let enc = new TextDecoder("utf-8");
      name = enc.decode(buffer.slice(fixedLen, posData));
    }

    // Parse data
    let data: Uint8Array;
    let lenData = lenBuffer - posData;
    if (lenData > 0) {
      data = new Uint8Array(lenData);
      data = buffer.slice(posData);
    }

    let temp = new Uint8Array(1);
    temp[0] = flag & 0x07;
    this.MessageID = msgID;
    this.MessageID = msgID;
    this.MessageType = temp[0];
    this.MessageTag = msgTag;
    this.IsFirst = (flag & 0x40) != 0;
    this.IsLast = (flag & 0x20) != 0;
    this.IsRequest = (flag & 0x10) != 0;
    this.IsEncrypted = isEncrypted;
    this.Name = name;
    this.IV = iv;
    this.Data = data;
    this.AuthenTag = authenTag;
    this.Sign = sign;
  }

  public GetAad(): Uint8Array {
    return BuildAad(
      this.MessageID,
      this.MessageTag,
      this.MessageType,
      this.IsEncrypted,
      this.IsFirst,
      this.IsLast,
      this.IsRequest,
      this.Name
    );
  }

  // GetRawBytes returns raw bytes of Cipher
  public GetRawBytes(): Uint8Array {
    return BuildRawBytes(
      this.MessageID,
      this.MessageTag,
      this.MessageType,
      this.IsEncrypted,
      this.IsFirst,
      this.IsLast,
      this.IsRequest,
      this.Name,
      this.Data
    );
  }

  public IntoBytes(): Uint8Array {
    if (this.IsEncrypted) {
      return BuildCipherBytes(
        this.MessageID,
        this.MessageTag,
        this.MessageType,
        this.IsFirst,
        this.IsLast,
        this.IsRequest,
        this.Name,
        this.IV,
        this.Data,
        this.AuthenTag
      );
    }
    return BuildNoCipherBytes(
      this.MessageID,
      this.MessageTag,
      this.MessageType,
      this.IsFirst,
      this.IsLast,
      this.IsRequest,
      this.Name,
      this.Data,
      this.Sign
    );
  }
}

// BuildCipherBytes builds bytes of Cipher (encrypted mode)
export function BuildCipherBytes(
  msgID: bigint,
  msgTag: bigint,
  msgType: Uint8Array[0],
  first: boolean,
  last: boolean,
  request: boolean,
  name: string,
  iv: Uint8Array,
  data: Uint8Array,
  authenTag: Uint8Array
): Uint8Array {
  return buildBytes(
    msgID,
    msgTag,
    msgType,
    true,
    first,
    last,
    request,
    name,
    iv,
    data,
    authenTag,
    new Uint8Array(0)
  );
}

// BuildRawBytes build raw bytes of Cipher
export function BuildRawBytes(
  msgID: bigint,
  msgTag: bigint,
  msgType: Uint8Array[0],
  encrypted: boolean,
  first: boolean,
  last: boolean,
  request: boolean,
  name: string,
  data: Uint8Array
): Uint8Array {
  let lenName = name.length;
  if (lenName == 0 || lenName > MaxConnectionNameLength) {
    return null;
  }
  let lenData = data.byteLength;

  let bEncrypted = new Uint8Array(1);
  let bFirst = new Uint8Array(1);
  let bLast = new Uint8Array(1);
  let bRequest = new Uint8Array(1);
  let bUseTag = new Uint8Array(1);

  if (encrypted) {
    bEncrypted[0] = 1;
  }
  if (first) {
    bFirst[0] = 1;
  }
  if (last) {
    bLast[0] = 1;
  }
  if (request) {
    bRequest[0] = 1;
  }

  let fixedLen = 10;
  if (msgTag > BigInt(0)) {
    bUseTag[0] = 1;
    fixedLen += 8;
  }

  let buffer = new Uint8Array(fixedLen + lenName + lenData);
  buffer[0] = Number(BigInt.asUintN(8, msgID.valueOf()));
  buffer[1] = Number(BigInt.asUintN(8, msgID >> BigInt(8)));
  buffer[2] = Number(BigInt.asUintN(8, msgID >> BigInt(16)));
  buffer[3] = Number(BigInt.asUintN(8, msgID >> BigInt(24)));
  buffer[4] = Number(BigInt.asUintN(8, msgID >> BigInt(32)));
  buffer[5] = Number(BigInt.asUintN(8, msgID >> BigInt(40)));
  buffer[6] = Number(BigInt.asUintN(8, msgID >> BigInt(48)));
  buffer[7] = Number(BigInt.asUintN(8, msgID >> BigInt(56)));
  buffer[8] =
    (bEncrypted[0] << 7) |
    (bFirst[0] << 6) |
    (bLast[0] << 5) |
    (bRequest[0] << 4) |
    (bUseTag[0] << 3) |
    msgType;
  buffer[9] = lenName;
  if (msgTag > BigInt(0)) {
    buffer[10] = Number(BigInt.asUintN(8, msgTag.valueOf()));
    buffer[11] = Number(BigInt.asUintN(8, msgTag >> BigInt(8)));
    buffer[12] = Number(BigInt.asUintN(8, msgTag >> BigInt(16)));
    buffer[13] = Number(BigInt.asUintN(8, msgTag >> BigInt(24)));
    buffer[14] = Number(BigInt.asUintN(8, msgTag >> BigInt(32)));
    buffer[15] = Number(BigInt.asUintN(8, msgTag >> BigInt(40)));
    buffer[16] = Number(BigInt.asUintN(8, msgTag >> BigInt(48)));
    buffer[17] = Number(BigInt.asUintN(8, msgTag >> BigInt(56)));
  }

  let nameBytes = new TextEncoder().encode(name);

  buffer.set(nameBytes, fixedLen);

  if (lenData > 0) {
    buffer.set(data, fixedLen + lenName);
  }
  return buffer;
}

// BuildAad build aad of Cipher
export function BuildAad(
  msgID: bigint,
  msgTag: bigint,
  msgType: Uint8Array[0],
  encrypted: boolean,
  first: boolean,
  last: boolean,
  request: boolean,
  name: string
): Uint8Array {
  let lenName = name?.length;
  if (lenName == 0 || lenName > MaxConnectionNameLength) {
    return null;
  }

  let bEncrypted = new Uint8Array(1);
  let bFirst = new Uint8Array(1);
  let bLast = new Uint8Array(1);
  let bRequest = new Uint8Array(1);
  let bUseTag = new Uint8Array(1);

  if (encrypted) {
    bEncrypted[0] = 1;
  }
  if (first) {
    bFirst[0] = 1;
  }
  if (last) {
    bLast[0] = 1;
  }
  if (request) {
    bRequest[0] = 1;
  }

  let fixedLen = 10;
  if (msgTag > BigInt("0")) {
    bUseTag[0] = 1;
    fixedLen += 8;
  }

  // let buffer = new Uint8Array(fixedLen + lenName);
  let buffer = [];
  buffer.push(Number(BigInt.asUintN(8, msgID.valueOf())));
  buffer.push(Number(BigInt.asUintN(8, msgTag >> BigInt(8))));
  buffer.push(Number(BigInt.asUintN(8, msgTag >> BigInt(16))));
  buffer.push(Number(BigInt.asUintN(8, msgTag >> BigInt(24))));
  buffer.push(Number(BigInt.asUintN(8, msgTag >> BigInt(32))));
  buffer.push(Number(BigInt.asUintN(8, msgTag >> BigInt(40))));
  buffer.push(Number(BigInt.asUintN(8, msgTag >> BigInt(48))));
  buffer.push(Number(BigInt.asUintN(8, msgTag >> BigInt(56))));
  buffer.push(
    (bEncrypted[0] << 7) |
      (bFirst[0] << 6) |
      (bLast[0] << 5) |
      (bRequest[0] << 4) |
      (bUseTag[0] << 3) |
      msgType
  );
  buffer.push(lenName);
  if (msgTag > BigInt(0)) {
    buffer.push(Number(BigInt.asUintN(8, msgTag)));
    buffer.push(Number(BigInt.asUintN(8, msgTag >> BigInt(8))));
    buffer.push(Number(BigInt.asUintN(8, msgTag >> BigInt(16))));
    buffer.push(Number(BigInt.asUintN(8, msgTag >> BigInt(24))));
    buffer.push(Number(BigInt.asUintN(8, msgTag >> BigInt(32))));
    buffer.push(Number(BigInt.asUintN(8, msgTag >> BigInt(40))));
    buffer.push(Number(BigInt.asUintN(8, msgTag >> BigInt(48))));
    buffer.push(Number(BigInt.asUintN(8, msgTag >> BigInt(56))));
  }
  let temp = new TextEncoder().encode(name);
  for (let i = 0; i < temp.length; i++) {
    buffer.push(temp[i]);
  }

  return new Uint8Array(buffer);
}

// BuildNoCipherBytes builds bytes of Cipher (unencrypted mode)
export function BuildNoCipherBytes(
  msgID: bigint,
  tag: bigint,
  msgType: Uint8Array[0],
  first: boolean,
  last: boolean,
  request: boolean,
  name: string,
  data: Uint8Array,
  sign: Uint8Array
): Uint8Array {
  let empty = new Uint8Array(0);
  return buildBytes(
    msgID,
    tag,
    msgType,
    false,
    first,
    last,
    request,
    name,
    empty,
    data,
    empty,
    sign
  );
}

export function buildBytes(
  msgID: bigint,
  msgTag: bigint,
  msgType: Uint8Array[0],
  encrypted: boolean,
  first: boolean,
  last: boolean,
  request: boolean,
  name: string,
  iv: Uint8Array,
  data: Uint8Array,
  authenTag: Uint8Array,
  sign: Uint8Array
): Uint8Array {
  let lenName = name.length;
  if (lenName == 0 || lenName > MaxConnectionNameLength) {
    return null;
  }

  let lenIV = iv.length;
  let lenAuthenTag = authenTag.length;
  let lenSign = sign.byteLength;
  if (encrypted && (lenAuthenTag != 16 || lenIV != 12)) {
    return null;
  }

  if (!encrypted && lenSign != 32) {
    return null;
  }

  let bEncrypted = new Uint8Array(1);
  let bFirst = new Uint8Array(1);
  let bLast = new Uint8Array(1);
  let bRequest = new Uint8Array(1);
  let bUseTag = new Uint8Array(1);
  if (encrypted) {
    bEncrypted[0] = 1;
  }
  if (first) {
    bFirst[0] = 1;
  }
  if (last) {
    bLast[0] = 1;
  }
  if (request) {
    bRequest[0] = 1;
  }

  let fixedLen = 10;
  if (msgTag > BigInt("0")) {
    bUseTag[0] = 1;
    fixedLen += 8;
  }

  let lenData = data.length;
  let lenBuffer = fixedLen + lenAuthenTag + lenIV + lenSign + lenName + lenData;
  let buffer = new Uint8Array(lenBuffer);
  buffer[0] = Number(BigInt.asUintN(8, msgID.valueOf()));
  buffer[1] = Number(BigInt.asUintN(8, msgID >> BigInt(8)));
  buffer[2] = Number(BigInt.asUintN(8, msgID >> BigInt(16)));
  buffer[3] = Number(BigInt.asUintN(8, msgID >> BigInt(24)));
  buffer[4] = Number(BigInt.asUintN(8, msgID >> BigInt(32)));
  buffer[5] = Number(BigInt.asUintN(8, msgID >> BigInt(40)));
  buffer[6] = Number(BigInt.asUintN(8, msgID >> BigInt(48)));
  buffer[7] = Number(BigInt.asUintN(8, msgID >> BigInt(56)));
  buffer[8] =
    (bEncrypted[0] << 7) |
    (bFirst[0] << 6) |
    (bLast[0] << 5) |
    (bRequest[0] << 4) |
    (bUseTag[0] << 3) |
    msgType;
  buffer[9] = lenName;
  if (msgTag > BigInt("0")) {
    buffer[10] = Number(msgTag);
    buffer[11] = Number(BigInt(msgTag) >> BigInt(8));
    buffer[12] = Number(BigInt(msgTag) >> BigInt(16));
    buffer[13] = Number(BigInt(msgTag) >> BigInt(24));
    buffer[14] = Number(BigInt(msgTag) >> BigInt(32));
    buffer[15] = Number(BigInt(msgTag) >> BigInt(40));
    buffer[16] = Number(BigInt(msgTag) >> BigInt(48));
    buffer[17] = Number(BigInt(msgTag) >> BigInt(56));
  }
  let posData = fixedLen + lenAuthenTag;
  if (encrypted) {
    buffer.set(authenTag, fixedLen);
    buffer.set(iv, posData);
    posData += lenIV;
  } else {
    buffer.set(sign, fixedLen);
    posData += lenSign;
  }
  buffer.set(new TextEncoder().encode(name), posData);
  posData += lenName;
  if (lenData > 0) {
    buffer.set(data, posData);
  }
  return buffer;
}
