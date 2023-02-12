
import {Optional} from "~/appCommon/base/baseApiTypes";
import {ComputedRef} from "vue";

export type TCounterState = {
  counterLBound: Optional<number>,
  counterRBound: Optional<number>,
}

/** counter, 實作 interval 物件*/
export interface ISafeInterval {
  /** 每個 counter 都有一個 setInterval id, 用來 clear interval*/
  id: Optional<number>;
  /** set counter
   * @params ms - in milliseconds */
  set(cb: (...args: any[]) => void, ms: number): void;
  clear(): void;
}

export interface IBaseReactiveCounter {
  state: TCounterState;
  interval: number;
  counter: ISafeInterval;

  /** reactive property, 判斷 counter 是否計數中, 即於 lbound/rbound 之間*/
  counterEnabled: ComputedRef<boolean>;
  /** reactive property, counter 以秒計，用於 ui 顥示*/
  currentCounter: ComputedRef<number>;
  /** set lbound */
  set(lbound: number): void;
  /** start a counter in seconds*/
  start(timeInSeconds: number): void;
  continue(): void;
  cancel(): void;
}
