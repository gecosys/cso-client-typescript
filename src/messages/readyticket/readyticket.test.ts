import { ReadyTicket } from "./readyticket";

test("Test ready ticket:", () => {
  let input = new Uint8Array([
    1,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    254,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
  ]);

  let readyTicket = new ReadyTicket();
  readyTicket.ParseBytes(input);
  expect(readyTicket).not.toBeNull();
  expect(readyTicket.IsReady).toBe(true);
  expect(readyTicket.IdxRead).toBe(BigInt("18446744073709551615"));
  expect(readyTicket.MaskRead).toBe(4294967295);
  expect(readyTicket.IdxWrite).toBe(BigInt("18446744073709551614"));
});

test("Test ready ticket:", () => {
  let input = new Uint8Array([
    0,
    254,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
  ]);

  let readyTicket = new ReadyTicket();
  readyTicket.ParseBytes(input);
  expect(readyTicket).not.toBeNull();
  expect(readyTicket.IsReady).toBe(false);
  expect(readyTicket.IdxRead).toBe(BigInt("18446744073709551614"));
  expect(readyTicket.MaskRead).toBe(4294967295);
  expect(readyTicket.IdxWrite).toBe(BigInt("18446744073709551615"));
});
