"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildBytes = exports.BuildAad = exports.BuildRawBytes = exports.Cipher = exports.type = void 0;
// MaxConnectionNameLength is max length of connections's name
var MaxConnectionNameLength = 36;
// MessageType is type of message (data) in Cipher
var MessageType;
var type;
(function (type) {
    // TypeActivation is type of activation message
    type[type["TypeActivation"] = 2] = "TypeActivation";
    // TypeSingle is type of single message (message sent to another connection)
    type[type["TypeSingle"] = 3] = "TypeSingle";
    // TypeGroup is type of group message (message sent to a group of connections)
    type[type["TypeGroup"] = 4] = "TypeGroup";
    // TypeSingleCached is type of single message (message sent to another connection and cached on system)
    type[type["TypeSingleCached"] = 5] = "TypeSingleCached";
    // TypeGroupCached is type of group message (message sent to a group of connections and cached on system)
    type[type["TypeGroupCached"] = 6] = "TypeGroupCached";
    // TypeDone is type of done message
    type[type["TypeDone"] = 7] = "TypeDone";
})(type = exports.type || (exports.type = {}));
// Cipher is encrypted message
var Cipher = /** @class */ (function () {
    function Cipher() {
    }
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
    Cipher.prototype.ParseBytes = function (buffer) {
        var fixedLen = 10;
        var posAuthenTag = 10;
        var lenBuffer = buffer.byteLength;
        if (lenBuffer < fixedLen) {
            return null;
        }
        var flag = buffer[8];
        var isEncrypted = (flag & 0x80) != 0;
        var msgID = (BigInt(buffer[7]) << BigInt(56)) |
            (BigInt(buffer[6]) << BigInt(48)) |
            (BigInt(buffer[5]) << BigInt(40)) |
            (BigInt(buffer[4]) << BigInt(32)) |
            (BigInt(buffer[3]) << BigInt(24)) |
            (BigInt(buffer[2]) << BigInt(16)) |
            (BigInt(buffer[1]) << BigInt(8)) |
            BigInt(buffer[0]);
        var lenName = Number(buffer[9]);
        var msgTag = BigInt(0);
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
        if (lenBuffer < fixedLen + lenName ||
            lenName == 0 ||
            lenName > MaxConnectionNameLength) {
            return null;
        }
        // Parse AUTHEN_TAG, IV
        var authenTag;
        var iv;
        var sign;
        if (isEncrypted) {
            authenTag = new Uint8Array(16);
            iv = new Uint8Array(12);
            var posIV = posAuthenTag + 16;
            authenTag = buffer.slice(posAuthenTag, posIV);
            iv = buffer.slice(posIV, fixedLen);
        }
        else {
            var posSign = fixedLen;
            fixedLen += 32;
            if (lenBuffer < fixedLen + lenName) {
                return null;
            }
            sign = new Uint8Array(32);
            sign = buffer.slice(posSign, fixedLen);
        }
        // Parse name
        var posData = fixedLen + lenName;
        var name = "";
        if (lenName > 0) {
            var enc = new TextDecoder("utf-8");
            name = enc.decode(buffer.slice(fixedLen, posData));
        }
        // Parse data
        var data;
        var lenData = lenBuffer - posData;
        if (lenData > 0) {
            data = new Uint8Array(lenData);
            data = buffer.slice(posData);
        }
        var temp = new Uint8Array(1);
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
    };
    Cipher.prototype.GetAad = function () {
        return BuildAad(this.MessageID, this.MessageTag, this.MessageType, this.IsEncrypted, this.IsFirst, this.IsLast, this.IsRequest, this.Name);
    };
    // GetRawBytes returns raw bytes of Cipher
    Cipher.prototype.GetRawBytes = function () {
        return BuildRawBytes(this.MessageID, this.MessageTag, this.MessageType, this.IsEncrypted, this.IsFirst, this.IsLast, this.IsRequest, this.Name, this.Data);
    };
    Cipher.prototype.IntoBytes = function () {
        if (this.IsEncrypted) {
            return BuildCipherBytes(this.MessageID, this.MessageTag, this.MessageType, this.IsFirst, this.IsLast, this.IsRequest, this.Name, this.IV, this.Data, this.AuthenTag);
        }
        return BuildNoCipherBytes(this.MessageID, this.MessageTag, this.MessageType, this.IsFirst, this.IsLast, this.IsRequest, this.Name, this.Data, this.Sign);
    };
    return Cipher;
}());
exports.Cipher = Cipher;
// BuildCipherBytes builds bytes of Cipher (encrypted mode)
function BuildCipherBytes(msgID, msgTag, msgType, first, last, request, name, iv, data, authenTag) {
    return buildBytes(msgID, msgTag, msgType, true, first, last, request, name, iv, data, authenTag, new Uint8Array(0));
}
// BuildRawBytes build raw bytes of Cipher
function BuildRawBytes(msgID, msgTag, msgType, encrypted, first, last, request, name, data) {
    var lenName = name.length;
    if (lenName == 0 || lenName > MaxConnectionNameLength) {
        return null;
    }
    var lenData = data.byteLength;
    var bEncrypted = new Uint8Array(1);
    var bFirst = new Uint8Array(1);
    var bLast = new Uint8Array(1);
    var bRequest = new Uint8Array(1);
    var bUseTag = new Uint8Array(1);
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
    var fixedLen = 10;
    if (msgTag > BigInt(0)) {
        bUseTag[0] = 1;
        fixedLen += 8;
    }
    var buffer = new Uint8Array(fixedLen + lenName + lenData);
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
    var nameBytes = new TextEncoder().encode(name);
    for (var i = 0; i < nameBytes.byteLength; i++) {
        buffer[fixedLen + i] = nameBytes[i];
    }
    if (lenData > 0) {
        for (var i = 0; i < data.byteLength; i++) {
            buffer[fixedLen + lenName + i] = data[i];
        }
    }
    return buffer;
}
exports.BuildRawBytes = BuildRawBytes;
// BuildAad build aad of Cipher
function BuildAad(msgID, msgTag, msgType, encrypted, first, last, request, name) {
    var lenName = name.length;
    if (lenName == 0 || lenName > MaxConnectionNameLength) {
        return null;
    }
    var bEncrypted = new Uint8Array(1);
    var bFirst = new Uint8Array(1);
    var bLast = new Uint8Array(1);
    var bRequest = new Uint8Array(1);
    var bUseTag = new Uint8Array(1);
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
    var fixedLen = 10;
    if (msgTag > BigInt("0")) {
        bUseTag[0] = 1;
        fixedLen += 8;
    }
    // let buffer = new Uint8Array(fixedLen + lenName);
    var buffer = [];
    buffer.push(Number(BigInt.asUintN(8, msgID.valueOf())));
    buffer.push(Number(BigInt.asUintN(8, msgTag >> BigInt(8))));
    buffer.push(Number(BigInt.asUintN(8, msgTag >> BigInt(16))));
    buffer.push(Number(BigInt.asUintN(8, msgTag >> BigInt(24))));
    buffer.push(Number(BigInt.asUintN(8, msgTag >> BigInt(32))));
    buffer.push(Number(BigInt.asUintN(8, msgTag >> BigInt(40))));
    buffer.push(Number(BigInt.asUintN(8, msgTag >> BigInt(48))));
    buffer.push(Number(BigInt.asUintN(8, msgTag >> BigInt(56))));
    buffer.push((bEncrypted[0] << 7) |
        (bFirst[0] << 6) |
        (bLast[0] << 5) |
        (bRequest[0] << 4) |
        (bUseTag[0] << 3) |
        msgType);
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
    var temp = new TextEncoder().encode(name);
    for (var i = 0; i < temp.length; i++) {
        buffer.push(temp[i]);
    }
    return new Uint8Array(buffer);
}
exports.BuildAad = BuildAad;
// BuildNoCipherBytes builds bytes of Cipher (unencrypted mode)
function BuildNoCipherBytes(msgID, tag, msgType, first, last, request, name, data, sign) {
    var empty = new Uint8Array(0);
    return buildBytes(msgID, tag, msgType, false, first, last, request, name, empty, data, empty, sign);
}
function buildBytes(msgID, msgTag, msgType, encrypted, first, last, request, name, iv, data, authenTag, sign) {
    var lenName = name.length;
    if (lenName == 0 || lenName > MaxConnectionNameLength) {
        return null;
    }
    var lenIV = iv.length;
    var lenAuthenTag = authenTag.length;
    var lenSign = sign.byteLength;
    if (encrypted && (lenAuthenTag != 16 || lenIV != 12)) {
        return null;
    }
    if (!encrypted && lenSign != 32) {
        return null;
    }
    var bEncrypted = new Uint8Array(1);
    var bFirst = new Uint8Array(1);
    var bLast = new Uint8Array(1);
    var bRequest = new Uint8Array(1);
    var bUseTag = new Uint8Array(1);
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
    var fixedLen = 10;
    if (msgTag > BigInt("0")) {
        bUseTag[0] = 1;
        fixedLen += 8;
    }
    var lenData = data.length;
    var lenBuffer = fixedLen + lenAuthenTag + lenIV + lenSign + lenName + lenData;
    var buffer = new Uint8Array(lenBuffer);
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
    var posData = fixedLen + lenAuthenTag;
    if (encrypted) {
        for (var i = 0; i < authenTag.length; i++) {
            buffer[fixedLen + i] = authenTag[i];
        }
        for (var i = 0; i < iv.length; i++) {
            buffer[posData + i] = iv[i];
        }
        posData += lenIV;
    }
    else {
        for (var i = 0; i < sign.byteLength; i++) {
            buffer[fixedLen + i] = sign[i];
        }
        posData += lenSign;
    }
    var temp = new TextEncoder().encode(name);
    for (var i = 0; i < temp.length; i++) {
        buffer[posData + i] = temp[i];
    }
    posData += lenName;
    if (lenData > 0) {
        for (var i = 0; i < data.length; i++) {
            buffer[posData + i] = data[i];
        }
    }
    return buffer;
}
exports.buildBytes = buildBytes;
