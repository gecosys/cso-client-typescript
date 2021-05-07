import * as Crypto from "crypto";

function CalcHMAC(key: Uint8Array, data: Uint8Array): Uint8Array {
  let mac = Crypto.createHmac("sha256", key);
  return new Uint8Array(mac.update(data).digest());
}

function ValidateHMAC(
  key: Uint8Array,
  data: Uint8Array,
  expectedHMAC: Uint8Array
) {
  let result = CalcHMAC(key, data);
  return result.toString() == expectedHMAC.toString();
}

const expectedHMAC = new Uint8Array([
  47,
  121,
  108,
  13,
  177,
  58,
  58,
  235,
  166,
  113,
  132,
  61,
  39,
  64,
  75,
  230,
  76,
  184,
  174,
  11,
  168,
  45,
  78,
  208,
  199,
  49,
  165,
  159,
  244,
  138,
  139,
  47,
]);
const key = new Uint8Array([
  114,
  203,
  246,
  0,
  37,
  216,
  117,
  58,
  193,
  41,
  160,
  114,
  203,
  246,
  0,
  37,
  216,
  117,
  58,
  193,
  41,
  160,
  124,
  41,
  159,
  100,
  79,
  136,
  82,
  108,
  22,
  76,
]);
var hashKey = new Uint8Array(Crypto.createHash("sha256").update(key).digest());

const data = new TextEncoder().encode("Goldeneye Technologies");
console.log(ValidateHMAC(hashKey, data, expectedHMAC));
