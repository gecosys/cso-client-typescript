import * as Crypto from "crypto";
import { BigInteger } from "jsbn";

// GenerateDHPrivateKey generates private DH key
function _randomBigInt(numberBytes: number): bigint {
  const value = Crypto.randomBytes(numberBytes);
  return BigInt(`0x${value.toString("hex")}`);
}
export function generatePrivateKey(): bigint {
  return _randomBigInt(32); //256 bit
}

export function calcPublicKey(
  gKey: BigInteger,
  nKey: BigInteger,
  privKey: BigInteger
): BigInteger {
  return new BigInteger(gKey.modPow(privKey, nKey).toString());
}

export function calcSecretKey(
  nKey: BigInteger,
  clientPrivKey: BigInteger,
  serverPubKey: BigInteger
): Uint8Array {
  let sharedKey = serverPubKey.modPow(clientPrivKey, nKey);
  let secretKey = Crypto.createHash("sha256")
    .update(new TextEncoder().encode(sharedKey.toString()))
    .digest();
  return new Uint8Array(secretKey);
}
