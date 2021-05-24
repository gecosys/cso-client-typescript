export abstract class ICounter {
  abstract nextWriteIndex(): BigUint64Array[0];
  abstract markReadUnused(idx: BigUint64Array[0]): void;
  abstract markReadDone(idx: BigUint64Array[0]): boolean;
}
