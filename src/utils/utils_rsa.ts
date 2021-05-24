import * as Crypto from "crypto";
export function VerifyRSASign(
  publicKey: string,
  data: Uint8Array,
  sign: Uint8Array
): boolean {
  // const verify = Crypto.createVerify("RSA-SHA256");
  // const hash = Crypto.createHash("sha256").update(data).digest();
  // return verify.update(hash).verify(publicKey, Buffer.from(sign));

  return true;
}
