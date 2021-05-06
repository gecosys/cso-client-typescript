import { BuildAad, BuildRawBytes, Cipher, type } from "./cipher";
const gConnName = "goldeneye_technologies";

// TestParseCipherBytes
test("Test cipher:", () => {
  var expectedIsEncrypted = true;
  var expectedIsFirst = true;
  var expectedIsLast = true;
  var expectedIsRequest = true;
  var expectedMessageID = BigInt(1024);
  var expectedMessageTag = BigInt(1025);
  var expectedMessageType = type.TypeSingle;
  var expectedName = gConnName;
  // var expectedSign = type.TypeSingle;
  var epxectedIV = new Uint8Array([
    52,
    69,
    113,
    36,
    207,
    171,
    168,
    50,
    162,
    40,
    224,
    187,
  ]);
  var epxectedAuthenTag = new Uint8Array([
    106,
    232,
    205,
    181,
    53,
    106,
    177,
    50,
    190,
    131,
    144,
    7,
    101,
    44,
    27,
    45,
  ]);
  var expectedData = new TextEncoder().encode("Goldeneye Technologies");
  var expectedAad = new Uint8Array([
    0,
    4,
    0,
    0,
    0,
    0,
    0,
    0,
    251,
    22,
    1,
    4,
    0,
    0,
    0,
    0,
    0,
    0,
    103,
    111,
    108,
    100,
    101,
    110,
    101,
    121,
    101,
    95,
    116,
    101,
    99,
    104,
    110,
    111,
    108,
    111,
    103,
    105,
    101,
    115,
  ]);

  var input = new Uint8Array([
    0,
    4,
    0,
    0,
    0,
    0,
    0,
    0,
    251,
    22,
    1,
    4,
    0,
    0,
    0,
    0,
    0,
    0,
    106,
    232,
    205,
    181,
    53,
    106,
    177,
    50,
    190,
    131,
    144,
    7,
    101,
    44,
    27,
    45,
    52,
    69,
    113,
    36,
    207,
    171,
    168,
    50,
    162,
    40,
    224,
    187,
    103,
    111,
    108,
    100,
    101,
    110,
    101,
    121,
    101,
    95,
    116,
    101,
    99,
    104,
    110,
    111,
    108,
    111,
    103,
    105,
    101,
    115,
    71,
    111,
    108,
    100,
    101,
    110,
    101,
    121,
    101,
    32,
    84,
    101,
    99,
    104,
    110,
    111,
    108,
    111,
    103,
    105,
    101,
    115,
  ]);
  let cipher = new Cipher();
  cipher.ParseBytes(input);
  expect(cipher).not.toBeNull();
  expect(cipher.IsEncrypted).toBe(expectedIsEncrypted);
  expect(cipher.IsFirst).toBe(expectedIsFirst);
  expect(cipher.IsLast).toBe(expectedIsLast);
  expect(cipher.IsRequest).toBe(expectedIsRequest);
  expect(cipher.MessageID).toBe(expectedMessageID);
  expect(cipher.MessageTag).toBe(expectedMessageTag);
  expect(cipher.MessageType).toBe(expectedMessageType);
  expect(cipher.Name).toBe(expectedName);
  expect(cipher.IV).toEqual(epxectedIV);
  expect(cipher.AuthenTag).toEqual(epxectedAuthenTag);
  let aad = cipher.GetAad();
  expect(aad).not.toBeNull();
  expect(aad).toEqual(expectedAad);
  expect(cipher.Data).toEqual(expectedData);
});

// TestParseNoCipherBytes;
test("Test Parse No Cipher Bytes:", () => {
  var expectedIsEncrypted = false;
  var expectedIsFirst = true;
  var expectedIsLast = true;
  var expectedIsRequest = true;
  var expectedMessageID = BigInt(1024);
  var expectedMessageTag = BigInt(1025);
  var expectedMessageType = type.TypeSingle;
  var expectedName = gConnName;
  var expectedAad = new Uint8Array([
    0,
    4,
    0,
    0,
    0,
    0,
    0,
    0,
    123,
    22,
    1,
    4,
    0,
    0,
    0,
    0,
    0,
    0,
    103,
    111,
    108,
    100,
    101,
    110,
    101,
    121,
    101,
    95,
    116,
    101,
    99,
    104,
    110,
    111,
    108,
    111,
    103,
    105,
    101,
    115,
  ]);
  var epxectedSign = new Uint8Array([
    140,
    57,
    139,
    30,
    167,
    65,
    206,
    46,
    33,
    131,
    181,
    152,
    42,
    206,
    205,
    79,
    59,
    223,
    16,
    25,
    61,
    95,
    68,
    163,
    49,
    147,
    106,
    188,
    66,
    151,
    202,
    88,
  ]);
  var expectedData = new TextEncoder().encode("Goldeneye Technologies");

  var input = new Uint8Array([
    0,
    4,
    0,
    0,
    0,
    0,
    0,
    0,
    123,
    22,
    1,
    4,
    0,
    0,
    0,
    0,
    0,
    0,
    140,
    57,
    139,
    30,
    167,
    65,
    206,
    46,
    33,
    131,
    181,
    152,
    42,
    206,
    205,
    79,
    59,
    223,
    16,
    25,
    61,
    95,
    68,
    163,
    49,
    147,
    106,
    188,
    66,
    151,
    202,
    88,
    103,
    111,
    108,
    100,
    101,
    110,
    101,
    121,
    101,
    95,
    116,
    101,
    99,
    104,
    110,
    111,
    108,
    111,
    103,
    105,
    101,
    115,
    71,
    111,
    108,
    100,
    101,
    110,
    101,
    121,
    101,
    32,
    84,
    101,
    99,
    104,
    110,
    111,
    108,
    111,
    103,
    105,
    101,
    115,
  ]);
  let cipher = new Cipher();
  cipher.ParseBytes(input);
  expect(cipher).not.toBeNull();
  expect(cipher.IsEncrypted).toBe(expectedIsEncrypted);
  expect(cipher.IsFirst).toBe(expectedIsFirst);
  expect(cipher.IsLast).toBe(expectedIsLast);
  expect(cipher.IsRequest).toBe(expectedIsRequest);
  expect(cipher.MessageID).toBe(expectedMessageID);
  expect(cipher.MessageTag).toBe(expectedMessageTag);
  expect(cipher.MessageType).toBe(expectedMessageType);
  expect(cipher.Name).toBe(expectedName);
  expect(cipher.Sign).toEqual(epxectedSign);
  let aad = cipher.GetAad();
  expect(aad).not.toBeNull();
  expect(aad).toEqual(expectedAad);
  expect(cipher.Data).toEqual(expectedData);
});

function randomBigInt() {
  return Math.floor(Math.random() * Math.pow(2, 64));
}

function randomArray(array: Uint8Array) {
  for (let i = 0; i < array.byteLength; i++) {
    array[i] = Math.floor(Math.random() * 255);
  }
}

function runCases() {
  let isEncrypted = true;
  let msgTypes = [
    type.TypeActivation,
    type.TypeDone,
    type.TypeGroup,
    type.TypeGroupCached,
    type.TypeSingle,
    type.TypeSingleCached,
  ];

  let flagsTables = [
    [true, true, true], // first, last, request
    [false, true, true],
    [true, false, true],
    [true, true, false],
    [false, false, true],
    [true, false, false],
    [false, true, false],
    [false, false, false],
  ];
  let result: Cipher[] = [];
  for (let i = 0; i < 2; i++) {
    isEncrypted = !isEncrypted;
    for (let j = 0; j < msgTypes.length; j++) {
      for (let k = 0; k < flagsTables.length; k++) {
        let iv = new Uint8Array(12);
        let data = new Uint8Array(1024);
        let authenTag = new Uint8Array(16);
        let sign = new Uint8Array(32);
        let msgID = BigInt(randomBigInt());
        let msgTag = BigInt(randomBigInt());
        randomArray(iv);
        randomArray(data);
        randomArray(authenTag);
        randomArray(sign);

        let isFirst = flagsTables[k][0];
        let isLast = flagsTables[k][1];
        let isRequest = flagsTables[k][2];

        let temp = new Cipher();
        temp.MessageID = msgID;
        temp.MessageTag = msgTag;
        temp.MessageType = msgTypes[i];
        temp.IV = iv;
        temp.Data = data;
        temp.AuthenTag = authenTag;
        temp.Sign = sign;
        temp.IsFirst = isFirst;
        temp.IsLast = isLast;
        temp.IsRequest = isRequest;
        temp.IsEncrypted = isEncrypted;

        result.push(temp);
      }
    }
  }
  return result;
}

// TestBuildRawBytes
describe("Test Build Raw Bytes:", () => {
  let expectedRawBytes = new Uint8Array([
    0,
    4,
    0,
    0,
    0,
    0,
    0,
    0,
    251,
    22,
    1,
    4,
    0,
    0,
    0,
    0,
    0,
    0,
    103,
    111,
    108,
    100,
    101,
    110,
    101,
    121,
    101,
    95,
    116,
    101,
    99,
    104,
    110,
    111,
    108,
    111,
    103,
    105,
    101,
    115,
    71,
    111,
    108,
    100,
    101,
    110,
    101,
    121,
    101,
    32,
    84,
    101,
    99,
    104,
    110,
    111,
    108,
    111,
    103,
    105,
    101,
    115,
  ]);
  let rawBytes = BuildRawBytes(
    BigInt(1024),
    BigInt(1025),
    type.TypeSingle,
    true,
    true,
    true,
    true,
    gConnName,
    new TextEncoder().encode("Goldeneye Technologies")
  );
  expect(rawBytes).not.toBeNull();
  expect(rawBytes).toEqual(expectedRawBytes);
  const cipher = runCases();
  test.each(cipher)("Build Raw Bytes %#:", (cipher) => {
    cipher.Name = gConnName;
    let expectedRawBytes = cipher.GetRawBytes();
    expect(expectedRawBytes).not.toBeNull();

    let rawBytes = BuildRawBytes(
      cipher.MessageID,
      cipher.MessageTag,
      cipher.MessageType,
      cipher.IsEncrypted,
      cipher.IsFirst,
      cipher.IsLast,
      cipher.IsRequest,
      gConnName,
      cipher.Data
    );
    expect(rawBytes).not.toBeNull();
    expect(rawBytes).toEqual(expectedRawBytes);
  });
});

// TestBuildAad
describe("Test Build Aad:", () => {
  let expectedAad = new Uint8Array([
    0,
    4,
    0,
    0,
    0,
    0,
    0,
    0,
    251,
    22,
    1,
    4,
    0,
    0,
    0,
    0,
    0,
    0,
    103,
    111,
    108,
    100,
    101,
    110,
    101,
    121,
    101,
    95,
    116,
    101,
    99,
    104,
    110,
    111,
    108,
    111,
    103,
    105,
    101,
    115,
  ]);
  let aad = BuildAad(
    BigInt(1024),
    BigInt(1025),
    type.TypeSingle,
    true,
    true,
    true,
    true,
    gConnName
  );
  expect(aad).not.toBeNull();
  expect(aad).toEqual(expectedAad);
  const cipher = runCases();
  test.each(cipher)("Build Aad %#:", (cipher) => {
    cipher.Name = gConnName;
    let expectedAad = cipher.GetAad();
    expect(expectedAad).not.toBeNull();
    let aad = BuildAad(
      cipher.MessageID,
      cipher.MessageTag,
      cipher.MessageType,
      cipher.IsEncrypted,
      cipher.IsFirst,
      cipher.IsLast,
      cipher.IsRequest,
      gConnName
    );
    expect(aad).not.toBeNull();
    expect(aad).toEqual(expectedAad);
  });
});

// TestIntoBytes
describe("Test Into Bytes:", () => {
  const cipher = runCases();
  test.each(cipher)("Into Bytes %#:", (cipher) => {
    cipher.Name = gConnName;
    let bytes = cipher.IntoBytes();
    expect(bytes).not.toBeNull();

    let parsedCipher = new Cipher();
    parsedCipher.ParseBytes(bytes);
    expect(parsedCipher).not.toBeNull();
    expect(cipher.IsEncrypted).toBe(parsedCipher.IsEncrypted);
    expect(cipher.IsFirst).toBe(parsedCipher.IsFirst);
    expect(cipher.IsLast).toBe(parsedCipher.IsLast);
    expect(cipher.IsRequest).toBe(parsedCipher.IsRequest);
    expect(cipher.MessageID).toBe(parsedCipher.MessageID);
    expect(cipher.MessageTag).toBe(parsedCipher.MessageTag);
    expect(cipher.MessageType).toBe(parsedCipher.MessageType);
    expect(cipher.Name).toBe(parsedCipher.Name);

    if (cipher.IsEncrypted) {
      expect(cipher.IV).toEqual(parsedCipher.IV);
      expect(cipher.AuthenTag).toEqual(parsedCipher.AuthenTag);
    } else {
      expect(cipher.Sign).toEqual(parsedCipher.Sign);
    }

    let aad = cipher.GetAad();
    expect(aad).not.toBeNull();

    let parsedAad = parsedCipher.GetAad();
    expect(parsedAad).not.toBeNull();
    expect(aad).toEqual(parsedAad);
    expect(cipher.Data).toEqual(parsedCipher.Data);
  });
});
