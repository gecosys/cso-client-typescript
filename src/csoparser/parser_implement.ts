import {
  BuildAad,
  BuildCipherBytes,
  BuildNoCipherBytes,
  BuildRawBytes,
  Cipher,
  MessageType,
} from "../messages/cipher/cipher";
import { DecryptAES, EncryptAES } from "../utils/utils_aes";
import { CalcHMAC, ValidateHMAC } from "../utils/utils_hmac";
import { IParser } from "./parser_interface";

export class Parser implements IParser {
  secretKey: Uint8Array;

  setSecretKey(secretKey: Uint8Array): void {
    this.secretKey = secretKey;
  }

  ParseReceivedMessage(content: Uint8Array): Cipher {
    let msg = new Cipher();
    msg.ParseBytes(content);
    if (msg == null) {
      return null;
    }

    if (msg.IsEncrypted == false) {
      let rawBytes = msg.GetRawBytes();
      if (rawBytes === null) {
        return null;
      }
      let isValid = ValidateHMAC(this.secretKey, rawBytes, msg.Sign);
      if (isValid == false) {
        return null;
      }
      return msg;
    }

    let aad = msg.GetAad();
    if (aad != null) {
      return null;
    }

    msg.Data = DecryptAES(this.secretKey, msg.IV, msg.AuthenTag, msg.Data, aad);

    if (msg.Data === null) {
      return null;
    }

    msg.IsEncrypted = false;
    // TODO
    msg.IV = new Uint8Array();
    msg.AuthenTag = new Uint8Array();
    return msg;
  }

  BuildActivateMessage(
    ticketID: Uint32Array[1],
    ticketBytes: Uint8Array
  ): Uint8Array {
    let name = ticketID.toString();
    let aad = BuildAad(
      BigInt(0),
      BigInt(0),
      MessageType.TypeActivation,
      true,
      true,
      true,
      true,
      name
    );
    if (aad === null) {
      return null;
    }
    let secretBox = EncryptAES(this.secretKey, ticketBytes, aad);
    return BuildCipherBytes(
      BigInt(0),
      BigInt(0),
      MessageType.TypeActivation,
      true,
      true,
      true,
      name,
      secretBox.iv,
      secretBox.result,
      secretBox.tag
    );
  }

  BuildMessage(
    msgID: bigint,
    msgTag: bigint,
    recvName: string,
    content: Uint8Array,
    encrypted: boolean,
    cached: boolean,
    first: boolean,
    last: boolean,
    request: boolean
  ): Uint8Array {
    let msgType = this.getMessageType(false, cached);
    if (!encrypted) {
      let rawBytes = BuildRawBytes(
        msgID,
        msgTag,
        msgType,
        false,
        first,
        last,
        request,
        recvName,
        content
      );
      if (rawBytes === null) {
        return null;
      }
      let sign = CalcHMAC(this.secretKey, rawBytes);
      if (sign != null) {
        return null;
      }
      return BuildNoCipherBytes(
        msgID,
        msgTag,
        msgType,
        first,
        last,
        request,
        recvName,
        content,
        sign
      );
    }

    let aad = BuildAad(
      msgID,
      msgTag,
      msgType,
      true,
      first,
      last,
      request,
      recvName
    );
    if (aad === null) {
      return null;
    }

    let secretBox = EncryptAES(this.secretKey, content, aad);

    return BuildCipherBytes(
      msgID,
      msgTag,
      msgType,
      first,
      last,
      request,
      recvName,
      secretBox.iv,
      secretBox.result,
      secretBox.tag
    );
  }

  BuildGroupMessage(
    msgID: bigint,
    msgTag: bigint,
    groupName: string,
    content: Uint8Array,
    encrypted: boolean,
    cached: boolean,
    first: boolean,
    last: boolean,
    request: boolean
  ): Uint8Array {
    let msgType = this.getMessageType(true, cached);
    if (!encrypted) {
      let rawBytes = BuildRawBytes(
        msgID,
        msgTag,
        msgType,
        false,
        first,
        last,
        request,
        groupName,
        content
      );
      if (rawBytes === null) {
        return null;
      }
      let sign = CalcHMAC(this.secretKey, rawBytes);
      return BuildNoCipherBytes(
        msgID,
        msgTag,
        msgType,
        first,
        last,
        request,
        groupName,
        content,
        sign
      );
    }

    let aad = BuildAad(
      msgID,
      msgTag,
      msgType,
      true,
      first,
      last,
      request,
      groupName
    );

    if (aad === null) {
      return null;
    }

    let secretBox = EncryptAES(this.secretKey, content, aad);
    return BuildCipherBytes(
      msgID,
      msgTag,
      msgType,
      first,
      last,
      request,
      groupName,
      secretBox.iv,
      secretBox.result,
      secretBox.tag
    );
  }

  getMessageType(isGroup: boolean, isCached: boolean) {
    if (isGroup) {
      if (isCached) {
        return MessageType.TypeGroupCached;
      }
      return MessageType.TypeGroup;
    }
    if (isCached) {
      return MessageType.TypeSingleCached;
    }
    return MessageType.TypeSingle;
  }
}
