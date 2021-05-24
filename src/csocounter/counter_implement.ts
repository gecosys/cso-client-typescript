import { ICounter } from "./counter_interface";

export class Counter implements ICounter {
  numberBits = BigInt(32);

  writeIndex: BigUint64Array[0];
  minReadIdx: BigUint64Array[0];
  maskReadBits: number;

  constructor(writeIndex: bigint, minReadIdx: bigint, maskReadBits: number) {
    this.writeIndex = writeIndex - BigInt(1);
    this.minReadIdx = minReadIdx;
    this.maskReadBits = maskReadBits;
  }

  nextWriteIndex(): BigUint64Array[0] {
    this.writeIndex += BigInt(1);
    return BigInt.asUintN(64, this.writeIndex);
  }
  markReadUnused(idx: BigUint64Array[0]): void {
    if (idx < this.minReadIdx) {
      return;
    }
    if (idx >= this.minReadIdx + this.numberBits) {
      return;
    }

    let uint32 = new Uint32Array(1);
    uint32[0] = 1;
    let mask = uint32[0] << Number(idx - this.minReadIdx);
    this.maskReadBits &= ~mask;
  }
  markReadDone(idx: BigUint64Array[0]): boolean {
    if (idx < this.minReadIdx) {
      return false;
    }

    if (idx >= this.minReadIdx + this.numberBits) {
      this.minReadIdx += this.numberBits;
      this.maskReadBits = 0;
    }

    let uint32 = new Uint32Array(1);
    uint32[0] = 1;
    let mask = uint32[0] << Number(idx - this.minReadIdx);
    if ((this.maskReadBits & mask) != 0) {
      return false;
    }
    this.maskReadBits |= mask;
    return true;
  }
}
