import { Config, IConfig } from "../config/config";
import {
  calcPublicKey,
  calcSecretKey,
  generatePrivateKey,
} from "../utils/utils_dh";
import { VerifyRSASign } from "../utils/utils_rsa";
import { IProxy } from "./proxy_interface";
import { BigInteger } from "jsbn";
import {
  RespExchangeKey,
  Response,
  RespRegisterConnection,
  ServerKey,
  ServerTicket,
} from "./proxy_message";
import { DecryptAES, EncryptAES } from "../utils/utils_aes";
import { Ticket } from "../messages/ticket/ticket";
var request = require("request");

export class Proxy implements IProxy {
  conf: IConfig;

  constructor(conf: IConfig) {
    this.conf = conf;
  }

  async exchangeKey(): Promise<ServerKey> {
    const url = `${this.conf.getCSOAddress()}/exchange-key`;
    let resp: Response;

    return new Promise((resolve, reject) => {
      request.post(
        {
          headers: { "content-type": "application/json" },
          url: url,
          body: JSON.stringify({
            project_id: this.conf.getProjectID(),
            unique_name: this.conf.getConnectionName(),
          }),
        },
        (error, response, body) => {
          resp = new Response(JSON.parse(body));
          if (resp.returnCode != 1 || resp.data == null) {
            reject();
            return;
          }

          const respExchangeKey = new RespExchangeKey(resp.data);

          // Parse signature base64
          let sign = Buffer.from(respExchangeKey.sign, "base64");

          // Verify DH keys with the signature
          let gKeyBytes = new TextEncoder().encode(respExchangeKey.gKey);
          let nKeyBytes = new TextEncoder().encode(respExchangeKey.nKey);
          let serverPubKeyBytes = new TextEncoder().encode(
            respExchangeKey.pubKey
          );
          let lenGKey = gKeyBytes.length;
          let lenGNKey = lenGKey + nKeyBytes.length;
          let lenBuffer = lenGNKey + serverPubKeyBytes.length;
          let buffer = new Uint8Array(lenBuffer);

          buffer.set(gKeyBytes, 0);
          buffer.set(nKeyBytes, lenGKey);
          buffer.set(serverPubKeyBytes, lenGNKey);

          let isValid = VerifyRSASign(
            this.conf.getCSOPublicKey(),
            sign,
            buffer
          );

          if (isValid == false) {
            reject();
            return;
          }

          // Parse DH keys to BigInt
          resolve(
            new ServerKey(
              BigInt(respExchangeKey.gKey),
              BigInt(respExchangeKey.nKey),
              BigInt(respExchangeKey.pubKey)
            )
          );
        }
      );
    });
  }

  async registerConnection(serverKey: ServerKey): Promise<ServerTicket> {
    const clientPrivKey = generatePrivateKey();

    // Calculate secret key (AES-GCM)
    let clientPubKey = calcPublicKey(
      new BigInteger(serverKey.gKey.toString()),
      new BigInteger(serverKey.nKey.toString()),
      new BigInteger(clientPrivKey.toString())
    );
    let clientSecretKey = calcSecretKey(
      new BigInteger(serverKey.nKey.toString()),
      new BigInteger(clientPrivKey.toString()),
      new BigInteger(serverKey.pubKey.toString())
    );

    // Encrypt project's token by AES-GCM
    let projectID = this.conf.getProjectID();
    let connName = this.conf.getConnectionName();
    let decodedToken = new Uint8Array(
      Buffer.from(this.conf.getProjectToken(), "base64")
    );
    let strClientPubKey = clientPubKey.toString();
    let lenProjectID = projectID.length;
    let lenProjectIDConnName = lenProjectID + connName.length;
    let lenAAD = lenProjectIDConnName + strClientPubKey.length;
    let clientAad = new Uint8Array(lenAAD);
    clientAad.set(Buffer.from(projectID), 0);
    clientAad.set(Buffer.from(connName), lenProjectID);
    clientAad.set(Buffer.from(strClientPubKey), lenProjectIDConnName);

    let cipherProjectToken = EncryptAES(
      clientSecretKey,
      decodedToken,
      clientAad
    );

    // Invoke API
    let url = `${this.conf.getCSOAddress()}/register-connection`;
    let resp: Response;

    let temp = {
      project_id: projectID,
      project_token: Buffer.from(cipherProjectToken.result).toString("base64"),
      unique_name: connName,
      public_key: strClientPubKey,
      iv: Buffer.from(cipherProjectToken.iv).toString("base64"),
      authen_tag: Buffer.from(cipherProjectToken.tag).toString("base64"),
    };

    return new Promise((resolve, reject) => {
      request.post(
        {
          headers: { "content-type": "application/json" },
          url: url,
          body: JSON.stringify(temp),
        },
        (error, response, body) => {
          resp = new Response(JSON.parse(body));

          if (resp.returnCode != 1 || resp.data == null) {
            reject();
            return;
          }

          let respRegisterConnection = new RespRegisterConnection(resp.data);
          let lenAadAddress = 2 + respRegisterConnection.hubAddress.length;
          let serverAad = new Uint8Array(
            lenAadAddress + respRegisterConnection.pubKey.length
          );

          let valTicketID = respRegisterConnection.ticketID;
          // let temp = new Uint16Array(1);
          // temp[0] = valTicketID;

          serverAad[0] = valTicketID;
          serverAad[1] = valTicketID >> 8;

          serverAad.set(Buffer.from(respRegisterConnection.hubAddress), 2);
          serverAad.set(
            Buffer.from(respRegisterConnection.pubKey),
            lenAadAddress
          );

          let serverPubKey = BigInt(respRegisterConnection.pubKey);
          let serverSecretKey = calcSecretKey(
            new BigInteger(serverKey.nKey.toString()),
            new BigInteger(clientPrivKey.toString()),
            new BigInteger(serverPubKey.toString())
          );

          let serverIV = Buffer.from(respRegisterConnection.iv, "base64");
          let serverAuthenTag = Buffer.from(
            respRegisterConnection.authenTag,
            "base64"
          );
          let serverTicketToken = Buffer.from(
            respRegisterConnection.ticketToken,
            "base64"
          );

          let ticketToken = DecryptAES(
            serverSecretKey,
            serverIV,
            serverAuthenTag,
            serverTicketToken,
            serverAad
          );

          // Build ticket bytes
          let ticketBytes = new Ticket().BuildBytes(valTicketID, ticketToken);
          if (ticketBytes === null) {
            reject();
            return;
          }
          resolve(
            new ServerTicket(
              respRegisterConnection.hubAddress,
              valTicketID,
              ticketBytes,
              serverSecretKey
            )
          );
        }
      );
    });
  }
}

let configFile = new Config();
configFile.fromFile("./src/config/cso_key.json");

let proxy = new Proxy(configFile);
proxy.exchangeKey().then(
  (serverKey: ServerKey) => {
    proxy.registerConnection(serverKey).then(
      (serverTicket: ServerTicket) => {
        console.log(serverTicket);
      },
      () => {
        console.log("Error registerConnection");
      }
    );
    // console.log(serverKey);
  },
  () => {
    console.log("Error exchangeKey");
  }
);
