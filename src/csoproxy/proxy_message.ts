// ServerKey is a group of server keys
export class ServerKey {
  gKey: bigint;
  nKey: bigint;
  pubKey: bigint;

  constructor(gKey?: bigint, nKey?: bigint, pubKey?: bigint) {
    if (gKey && nKey && pubKey) {
      this.gKey = gKey;
      this.nKey = nKey;
      this.pubKey = pubKey;
    } else {
      this.gKey = BigInt(0);
      this.nKey = BigInt(0);
      this.pubKey = BigInt(0);
    }
  }
}

// ServerTicket is an activation ticket from the Hub server
export class ServerTicket {
  hubAddress: string;
  ticketID: number;
  ticketBytes: Uint8Array;
  serverSecretKey: Uint8Array;

  constructor(
    hubAddress: string,
    ticketID: number,
    ticketBytes: Uint8Array,
    serverSecretKey: Uint8Array
  ) {
    if (hubAddress && ticketID && ticketBytes && serverSecretKey) {
      this.hubAddress = hubAddress;
      this.ticketID = ticketID;
      this.ticketBytes = ticketBytes;
      this.serverSecretKey = serverSecretKey;
    } else {
      this.hubAddress = "";
      this.ticketID = 0;
      this.ticketBytes = new Uint8Array();
      this.serverSecretKey = new Uint8Array();
    }
  }
}

// Response is format message of HTTP response from the Proxy server
export class Response {
  returnCode: number;
  timestamp: number;
  data: any;

  constructor(json: JSON) {
    this.returnCode = json["returncode"] || 0;
    this.timestamp = json["timestamp"] || 0;
    this.data = json["data"];
  }
}

// RespExchangeKey is response of exchange-key API from the Proxy server
export class RespExchangeKey {
  gKey: string;
  nKey: string;
  pubKey: string;
  sign: string;

  constructor(json: JSON) {
    this.gKey = json["g_key"] || "0";
    this.nKey = json["n_key"] || "0";
    this.pubKey = json["pub_key"] || "0";
    this.sign = json["sign"] || "";
  }
}

// RespRegisterConnection is response of register-connection API from the Proxy server
export class RespRegisterConnection {
  hubAddress: string;
  ticketID: number;
  ticketToken: string;
  pubKey: string;
  iv: string;
  authenTag: string;

  constructor(json: JSON) {
    this.hubAddress = json["hub_address"] || "";
    this.ticketID = json["ticket_id"] || 0;
    this.ticketToken = json["ticket_token"] || "";
    this.pubKey = json["pub_key"] || "0";
    this.iv = json["iv"] || "";
    this.authenTag = json["auth_tag"] || "";
  }
}
