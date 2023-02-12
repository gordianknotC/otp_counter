/**
 *    provide safe methods for operating
 *      setInterval
 *      clearTimeout
 *
 * */


import {IBaseReactiveCounter, ISafeInterval, TCounterState} from "~/appCommon/counter/counter_base_typedef";
import {computed, ComputedRef, reactive} from "vue";
import {Optional} from "~/appCommon/base/baseApiTypes";
import {is} from "~/appCommon/extendBase/impls/utils/typeInferernce";

/**
 *    {@inheritDoc} ISafeInterval
 *    {@inheritDoc ISafeInterval}
 *    提供可以被追踪的 set interval 功能
 *    所有 interval 均存入 {@link SafeInterval.ALL_TIMEOUTS},
 *    可 {@link clearAll} 清除所有的 interval
 * */
export class SafeInterval implements ISafeInterval {
  static ALL_TIMEOUTS:SafeInterval[] = [];
  static clearAll(){
    SafeInterval.ALL_TIMEOUTS.forEach((t)=> {
        t.clear();
    });
  }

  id: Optional<number>;

  constructor() {
    SafeInterval.ALL_TIMEOUTS.push(this);
  }

  /** set counter
   *  @param cb   -  callback function 每 ms miniSeconds 呼叫一次
   *  @param ms   -  每 ms miniSeconds 呼叫一次  callback
   *  @param args -  提供 callback function arguments
   * */
  set(cb: (...args: any[]) => void, ms: number, ...args: any[]) {
    this.clear();
    this.id = setInterval(cb, ms, args) as any as number;
  }

  /**
   *  clearing  time out in a safe way
   * */
  clear() {
    if (is.not.undefined(this.id)) {
      clearTimeout(this.id!);
      this.id = undefined;
    }
  }
}
/** {@inheritDoc IBaseReactiveCounter} */
export abstract class BaseReactiveCounter implements IBaseReactiveCounter {
  state: TCounterState;
  interval: number;
  counter: SafeInterval;
  counterEnabled: ComputedRef<boolean>;
  currentCounter: ComputedRef<number>;

  constructor(interval?: number) {
    const state = {
      counterLBound: undefined,
      counterRBound: undefined,
    };

    this.interval = interval ?? 1000;
    this.state    = reactive(state);
    this.counter  = new SafeInterval();
    this.counterEnabled = computed(()=>{
      const lbound = this.state.counterLBound;
      const rbound = this.state.counterRBound;
      const result = is.initialized(rbound) && is.initialized(lbound);
      return result && rbound! > lbound!;
    });

    this.currentCounter =  computed(()=>{
      if (this.counterEnabled.value){
        return Math.floor((((this.state.counterRBound ?? 0) - this.state.counterLBound!) / 1000 + 0.5));
      }else{
        return 0;
      }
    });

    console.log("ReactiveCounter:", state);
  }

  set(lbound: number) {
    this.state.counterLBound = lbound;
    this.afterSet(lbound);
  }

  start(periodInSeconds: number) {
    this.state.counterLBound = new Date(Date.now()).getTime();
    this.state.counterRBound = this.state.counterLBound + periodInSeconds * 1000;
    this.set(this.state.counterLBound);
    this.counter.clear();
    this.counter.set((_) => {
      this.set(new Date(Date.now()).getTime());
      if (!this.counterEnabled.value) {
        console.log('clear timeout since not enabled');
        this.cancel();
      }
      if (this.state.counterRBound! <= this.state.counterLBound!) {
        console.log('clear timeout since timer already finished')
        this.cancel();
      }
    }, this.interval);

    console.log('start counter, lbound:', this.state.counterLBound, 'rbound:',this.state.counterRBound, this);
  }

  continue() {
    if (this.counterEnabled.value) {
      this.state.counterLBound = new Date(Date.now()).getTime();
      const period = this.currentCounter.value;
      this.start(period);
    }
  }

  cancel() {
    this.state.counterLBound = undefined;
    this.state.counterRBound = undefined;
    this.counter.clear();
    this.afterCancel();
  }

  /** set 後呼叫，使用者可實作覆蓋 */
  protected abstract afterSet(lbound: number): void;
  /** cancel 後呼叫，使用者可實作覆蓋 */
  protected abstract afterCancel(): void;
}



