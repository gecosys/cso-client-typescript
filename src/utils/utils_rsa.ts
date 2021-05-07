import * as Crypto from "crypto";
export function VerifyRSASign(
  data: Uint8Array,
  publicKey: Uint8Array,
  sign: Uint8Array
) {
  let verify = Crypto.createVerify("RSA-SHA256");
  verify.update(new TextDecoder("utf-8").decode(data), "utf-8");
  return verify.verify(new TextDecoder("utf-8").decode(publicKey), sign);
}
