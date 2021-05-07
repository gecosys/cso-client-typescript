import * as Crypto from "crypto";
const ALGORITHM = "aes-256-gcm";

// EncryptAES encrypts data by AES with GCM mode
function EncryptAES(key: Uint8Array, data: Uint8Array, aad: Uint8Array) {
  const iv = new Uint8Array(Crypto.randomBytes(16));

  const cipher = Crypto.createCipheriv(ALGORITHM, key, iv);
  cipher.setAAD(aad);
  let encrypted = cipher.update(
    new TextDecoder("utf-8").decode(data),
    "utf8",
    "hex"
  );
  encrypted += cipher.final("hex");
  const tag = new Uint8Array(cipher.getAuthTag());

  let output = {
    IV: iv,
    TAG: tag,
    result: new TextEncoder().encode(encrypted),
  };

  return output;
}

function DecryptAES(
  key: Uint8Array,
  iv: Uint8Array,
  authenTag: Uint8Array,
  data: Uint8Array,
  aad: Uint8Array
) {
  // Decrypting
  var decipher = Crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAAD(aad);
  decipher.setAuthTag(authenTag);

  var decText = decipher.update(
    new TextDecoder("utf-8").decode(data),
    "hex",
    "utf8"
  );
  decText += decipher.final("utf8");

  return new TextEncoder().encode(decText);
}

const key = new Uint8Array([
  140,
  34,
  32,
  16,
  190,
  30,
  86,
  112,
  191,
  254,
  35,
  254,
  55,
  187,
  216,
  183,
  228,
  35,
  121,
  11,
  185,
  179,
  187,
  112,
  170,
  190,
  126,
  218,
  85,
  61,
  28,
  93,
]);
const data = new TextEncoder().encode("Goldeneye Technologies");
const aad = new TextEncoder().encode("Goldeneye Cloud Socket");

let temp1 = EncryptAES(key, data, aad);

let temp2 = DecryptAES(key, temp1.IV, temp1.TAG, temp1.result, aad);

console.log(new TextDecoder("utf-8").decode(temp2));
