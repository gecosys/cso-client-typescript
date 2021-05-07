import * as Crypto from "crypto";
import { CalcHMAC, ValidateHMAC } from "./utils_hmac";

test("Calculate HMAC", () => {
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
  var hashKey = new Uint8Array(
    Crypto.createHash("sha256").update(key).digest()
  );

  let hmac = CalcHMAC(
    hashKey,
    new TextEncoder().encode("Goldeneye Technologies")
  );
  expect(hmac).toEqual(expectedHMAC);
});

test("Validate HMAC", () => {
  let expectedHMAC = new Uint8Array([
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
  let key = new Uint8Array([
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
  var hashKey = new Uint8Array(
    Crypto.createHash("sha256").update(key).digest()
  );

  let isSuccess = ValidateHMAC(
    hashKey,
    new TextEncoder().encode("Goldeneye Technologies"),
    expectedHMAC
  );

  expect(isSuccess).toBe(true);
});

test("Validate HMAC with wrong data", () => {
  let expectedHMAC = new Uint8Array([
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
  let key = new Uint8Array([
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

  var hashKey = new Uint8Array(
    Crypto.createHash("sha256").update(key).digest()
  );

  let isSuccess = ValidateHMAC(
    hashKey,
    new TextEncoder().encode("Goldeneye Technologies"),
    expectedHMAC
  );

  expect(isSuccess).toBe(true);
});

test("Validate HMAC with wrong key", () => {
  let expectedHMAC = new Uint8Array([
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
  let key = new Uint8Array([
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
    109,
    22,
    76,
  ]);
  var hashKey = new Uint8Array(
    Crypto.createHash("sha256").update(key).digest()
  );

  let isSuccess = ValidateHMAC(
    hashKey,
    new TextEncoder().encode("Goldeneye Technologies"),
    expectedHMAC
  );

  expect(isSuccess).toBe(false);
});
