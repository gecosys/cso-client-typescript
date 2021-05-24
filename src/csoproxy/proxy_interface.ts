import { ServerKey, ServerTicket } from "./proxy_message";

export abstract class IProxy {
  abstract exchangeKey(): Promise<ServerKey>;
  abstract registerConnection(serverKey: ServerKey): Promise<ServerTicket>;
}
