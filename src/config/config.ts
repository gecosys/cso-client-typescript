export abstract class IConfig {
  abstract getProjectID(): string;
  abstract getProjectToken(): string;
  abstract getConnectionName(): string;
  abstract getCSOPublicKey(): string;
  abstract getCSOAddress(): string;
}

export class Config implements IConfig {
  projectID: string;
  projectToken: string;
  connName: string;
  csoPublicKey: string;
  csoAddress: string;

  constructor(
    csoAddress?: string,
    csoPublicKey?: string,
    connName?: string,
    projectToken?: string,
    projectID?: string
  ) {
    this.projectID = projectID || "";
    this.projectToken = projectToken || "";
    this.connName = connName || "";
    this.csoPublicKey = csoPublicKey || "";
    this.csoAddress = csoAddress || "";
  }

  fromFile(filePath: string) {
    var fs = require("fs");
    let resp = JSON.parse(fs.readFileSync(filePath).toString());

    this.projectID = resp.pid;
    this.projectToken = resp.ptoken;
    this.connName = resp.cname;
    this.csoPublicKey = resp.csopubkey;
    this.csoAddress = resp.csoaddr;
  }

  getProjectID(): string {
    return this.projectID;
  }
  getProjectToken(): string {
    return this.projectToken;
  }
  getConnectionName(): string {
    return this.connName;
  }
  getCSOPublicKey(): string {
    return this.csoPublicKey;
  }
  getCSOAddress(): string {
    return this.csoAddress;
  }
}
