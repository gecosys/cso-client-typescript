import { ItemQueue } from "./queue_entity";

export abstract class IQueue {
  abstract pushMessage(item: ItemQueue): boolean;
  abstract nextMessage(): ItemQueue;
  abstract clearMessage(msgID: bigint): void;
}
