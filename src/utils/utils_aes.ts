import * as Crypto from "crypto";
const ALGORITHM = "aes-256-gcm";

// EncryptAES encrypts data by AES with GCM mode
export function EncryptAES(
  key: Uint8Array,
  data: Uint8Array,
  aad: Uint8Array
): { iv: Uint8Array; tag: Uint8Array; result: Uint8Array } {
  const iv = new Uint8Array(Crypto.randomBytes(12));

  const cipher = Crypto.createCipheriv(ALGORITHM, key, iv);
  cipher.setAAD(aad);
  let encrypted = cipher.update(data);
  cipher.final();
  const tag = new Uint8Array(cipher.getAuthTag());

  let output = {
    iv: iv,
    tag: tag,
    result: new Uint8Array(encrypted),
  };

  return output;
}

export function DecryptAES(
  key: Uint8Array,
  iv: Uint8Array,
  authenTag: Uint8Array,
  data: Uint8Array,
  aad: Uint8Array
): Uint8Array {
  // Decrypting
  var decipher = Crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAAD(aad);
  decipher.setAuthTag(authenTag);
  var decText = decipher.update(data);
  decipher.final();

  return new Uint8Array(decText);
}
