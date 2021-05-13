import * as Crypto from "crypto";
export function VerifyRSASign(
  publicKey: string,
  data: Uint8Array,
  sign: Uint8Array
) {
  let verify = Crypto.createVerify("RSA-SHA256");
  verify.update(new TextDecoder("utf-8").decode(data), "utf-8");
  return verify.verify(publicKey, sign);
}
