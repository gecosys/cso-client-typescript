import { Proxy } from "./src/csoproxy/proxy_implement";
import { Config } from "./src/config/config";
import { Connector } from "./src/csoconnector/connector_implement";
import { IConnector } from "./src/csoconnector/conn_interface";
import { Parser } from "./src/csoparser/parser_implement";
import { Queue } from "./src/csoqueue/queue_implement";

const bufferSize = 1024;

// Read config from file
let config = new Config();
config.fromFile("src/config/cso_key.json");

// Init connector
let connector = new Connector(
  bufferSize,
  new Queue(bufferSize),
  new Parser(),
  new Proxy(config)
);
// let connector = new Connector();
// connector.initDefault(bufferSize, config);

// Open a connection to the Cloud Socket system
connector.listen((sender, data) => {
  console.log(`Received message from ${sender}`);
  console.log(Buffer.from(data).toString("utf8"));
  return 1;
});

// Send a message to the connection itself every 1 second
loopSendMessage(config.connName, connector);

function loopSendMessage(receiver: string, connector: IConnector) {
  Connector.sleep(1000).then(async () => {
    let errorCode = await connector.sendMessage(
      receiver,
      new Uint8Array(Buffer.from("Goldeneye ECO")),
      true,
      false
    );
    if (errorCode === null) {
      console.log("Send message failed");
    }
    loopSendMessage(receiver, connector);
  });
}
