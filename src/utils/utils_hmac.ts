import * as Crypto from "crypto";

export function CalcHMAC(key: Uint8Array, data: Uint8Array): Uint8Array {
  let mac = Crypto.createHmac("sha256", key);
  return new Uint8Array(mac.update(data).digest());
}

export function ValidateHMAC(
  key: Uint8Array,
  data: Uint8Array,
  expectedHMAC: Uint8Array
): boolean {
  let result = CalcHMAC(key, data);
  return result.toString() == expectedHMAC.toString();
}
