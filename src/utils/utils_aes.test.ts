import { DecryptAES, EncryptAES } from "./utils_aes";

test("Encrypt", () => {
  const key = new Uint8Array([
    140, 34, 32, 16, 190, 30, 86, 112, 191, 254, 35, 254, 55, 187, 216, 183,
    228, 35, 121, 11, 185, 179, 187, 112, 170, 190, 126, 218, 85, 61, 28, 93,
  ]);
  const data = new TextEncoder().encode("Goldeneye Technologies");
  const aad = new TextEncoder().encode("Goldeneye Cloud Socket");
  let cipher = EncryptAES(key, data, aad);
  let msg = DecryptAES(key, cipher.iv, cipher.tag, cipher.result, aad);

  expect(msg).toEqual(data);
});

test("Decrypt", () => {
  let expectedMsg = new TextEncoder().encode("Goldeneye Technologies");
  let aad = new TextEncoder().encode("Goldeneye Cloud Socket");
  let key = new Uint8Array([
    140, 34, 32, 16, 190, 30, 86, 112, 191, 254, 35, 254, 55, 187, 216, 183,
    228, 35, 121, 11, 185, 179, 187, 112, 170, 190, 126, 218, 85, 61, 28, 93,
  ]);
  let iv = new Uint8Array([68, 68, 112, 15, 17, 145, 19, 172, 188, 31, 15, 69]);
  let authenTag = new Uint8Array([
    170, 251, 82, 234, 140, 139, 57, 223, 65, 172, 74, 130, 63, 168, 231, 63,
  ]);
  let cipher = new Uint8Array([
    183, 226, 253, 107, 136, 203, 236, 30, 173, 76, 207, 202, 221, 20, 235, 144,
    202, 70, 78, 15, 13, 31,
  ]);

  let msg = DecryptAES(key, iv, authenTag, cipher, aad);

  expect(msg).toEqual(expectedMsg);
});
