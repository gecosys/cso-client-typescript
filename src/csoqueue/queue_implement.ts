import { ItemQueue } from "./queue_entity";
import { IQueue } from "./queue_interface";

export class Queue implements IQueue {
  cap: number;
  len: number;
  items: ItemQueue[];

  constructor(cap: number) {
    this.cap = cap;
    this.len = 0;
    this.items = [];
  }

  pushMessage(item: ItemQueue): boolean {
    if (this.len == this.cap) {
      return false;
    }
    for (var idx = 0; idx < this.cap; ++idx) {
      if (this.items[idx] == null) {
        ++this.len;
        this.items[idx] = item;
        return true;
      }
    }
    return false;
  }

  nextMessage() {
    let limitSecond = BigInt(3);
    let now = BigInt(new Date().getTime());
    let nextItem: ItemQueue;
    for (var idx = 0; idx < this.cap; ++idx) {
      let item = this.items[idx];
      if (item == null) {
        continue;
      }
      if (nextItem == null && now - item.getTimestamp() >= limitSecond) {
        nextItem = item;
        item.setTimestamp(now);
        item.setNumberRetry(item.getNumberRetry() - 1);
      }
      if (item.getNumberRetry() == 0) {
        this.items[idx] = null;
        --this.len;
      }
    }
    return nextItem;
  }

  clearMessage(msgID: bigint): void {
    for (var idx = 0; idx < this.cap; ++idx) {
      let item = this.items[idx];
      if (item != null && item.getMsgID() == msgID) {
        this.items[idx] = null;
        --this.len;
      }
    }
  }
}
