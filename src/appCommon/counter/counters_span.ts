import {BaseReactiveCounter} from "~/appCommon/counter/counter_base";
import {IBaseSpanCounter} from "~/appCommon/counter/counters_span_typedef";
import {computed, ComputedRef, reactive, watch} from "vue";
import {TCounterState} from "~/appCommon/counter/counter_base_typedef";
import {watchAndStore} from "~/appCommon/extendBase/impls/baseStorageService";

const INFINITY = Infinity;

export enum CounterStage {
  /** 正計數中，未啓動 new counter, 設計於當 counter 還在計數，且 retries == maxRetries
   *  這時無法啓用新 counter, 也尚未超出 maxRetries */
  counting,
  /** 啓動 new counter */
  startNewCount,
  /** 超出 maxRetries */
  exceedMaxRetries,
}


/** {@inheritDoc BaseReactiveCounter}
 *
 * */
export abstract class BaseSpanCounter extends BaseReactiveCounter implements IBaseSpanCounter{
  state: TCounterState & {
    maxTimes: number,
    span: number,
    retries: number,
  };
  /** reactive property - maxRetries > retries
   *  使用者可覆寫其邏輯，如不使用 maxRetries 而是讀取 nestedCounter 次數
   * */
  hasExceedMaxRetries: ComputedRef<boolean>;
  /** reactive property - maxRetries < retries
   *  使用者可覆寫其邏輯，如不使用 maxRetries 而是讀取 nestedCounter 次數
   * */
  canStartNewCount: ComputedRef<boolean>;
  /** 用於儲存 localstorage */
  private storeKey: string;

  protected constructor(option: {
    /** 最大次數 */
    maxTimes: number,
    /** 跨度時間 in seconds */
    span: number,
    /** 用於儲存 localstorage */
    storeKey: string,
  }) {
    super();
    if (option.maxTimes == 0){
      option.maxTimes = INFINITY
    }

    this.storeKey = option.storeKey;
    // @ts-ignore
    const prevState = this.state;
    const newState = {
      maxTimes: option.maxTimes,
      span: option.span,
      retries: 0,
      counterLBound: prevState.counterLBound,
      counterRBound: prevState.counterRBound
    };
    this.state = reactive(newState);
    this.hasExceedMaxRetries = computed(()=>{
      const props = [this.state.retries, this.state.maxTimes]
      if (this.state.retries == INFINITY)
        return true;
      return this.state.retries > this.state.maxTimes;
    });
    this.canStartNewCount = computed(()=>{
      return this.state.retries < this.state.maxTimes;
    });
    this.watchPropertyChange();
  }

  protected startCount() : CounterStage[]{
    this.state.retries++;
    if (this.hasExceedMaxRetries.value) {
      console.log('ban span counter, since hasExceedMaxRetries');
      this.didExceedMaxRetries();
      this._onStart(CounterStage.exceedMaxRetries);
      return [CounterStage.exceedMaxRetries];
    } else {
      console.log('start counter', this.constructor.name);
      if (this.canStartNewSpan()){
        super.start(this.state.span);
      }
      this._onStart(CounterStage.startNewCount);
      return [CounterStage.startNewCount];
    }
  }
  /** start a new counter or not
   * @returns
   *  - CounterStage.counting - 正計數中，未啓動 new counter
   *  - CounterStage.exceedMaxRetries - 超出 maxRetries
   *  - CounterStage.startNewCount - 啓動 new counter
   *
   *  CounterStage.counting 設計於當 counter 還在計數，且 retries == maxRetries
   *  這時無法啓用新 counter, 也尚未超出 maxRetries
   * */
  start(): CounterStage[] {
    if (this.counterEnabled.value){
      console.log("continue span counter, since not completed yet");
      this._onStart(CounterStage.counting);
      return [CounterStage.counting];
    }else{
      return this.startCount();
    }
  }

  private _onStart: (stage: CounterStage)=> void = (stage)=>{};
  onStart(cb: (stage: CounterStage)=>void, once: boolean = true){
    this._onStart = cb;
  }


  continue() {
    if (this.counterEnabled.value) {
      this.state.counterLBound = new Date(Date.now()).getTime();
      const period = this.currentCounter.value;
      super.start(period);
    }
  }


  reset(): Promise<any>{
    return new Promise((resolve, reject)=>{
      const unwatcher = watch(this.state, ()=>{
        unwatcher();
        this.cancel();
        console.log('unwatch reset');
        resolve(true);
      });
      unwatcher();
      this.state.retries = 0;
      this.cancel();
    });
  }

  cancel() {
    this.state.counterLBound = undefined;
    this.state.counterRBound = undefined;
    this.counter.clear();
    this.afterCancel();
  }


  /** 當新的span開始時
   *  @remarks 依使用者需要覆寫
   *  @returns
   *    - false to stop starting a new counter
   *    - true to continue starting a new counter
   * */
  protected canStartNewSpan(): boolean {
    return true;
  }

  /** watch property and store into localstoreage
   *  @remark 使用者可覆寫擴展其功能，但需要 call super 才能保
   *  留 {@link watchAndStore} 功能
   * */
  protected watchPropertyChange():void{
    const {maxTimes, span, retries} = this.state;
    console.warn("watchAndStore:", this.storeKey);
    watchAndStore({
      loadOnInitialize: true,
      omits: [],
      storage: localStorage,
      storeIdent: this.storeKey,
      unwrapRef: this.state,
      defaults:{
        maxTimes, span, retries
      }
    });
  };

  /** 超出 max retries 時呼叫, 重設 this.state.retries
   *  @remark 使用者可覆寫擴展其功能，但需要 call super 才能保
   *  留 {@link watchAndStore} 功能
   * */
  protected didExceedMaxRetries() {
    const startTime = new Date(Date.now()).getTime();
    const isWithinValidPeriod = startTime < this.state.counterRBound!;
    console.log('didExceedMaxRetries', isWithinValidPeriod, startTime, this.state.counterRBound);
    this.state.retries = Math.max(this.state.maxTimes + 1, this.state.retries);
    if (this.counterEnabled.value){
      // pass counter 繼續走
    }else{
    }
  }
}

