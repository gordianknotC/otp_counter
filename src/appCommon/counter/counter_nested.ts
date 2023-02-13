import {BaseSpanCounter, CounterStage,} from "~/appCommon/counter/counters_span";
import {IBaseNestedCounter} from "~/appCommon/counter/counters_nested_typedef";


type TPeriodCounterOption = {
  span: number,
  period: number,
  maxTimesPerSpan: number,
}

/** {@inheritDoc BaseSpanCounter}
 *
 * */
export
abstract class BaseNestedCounter extends BaseSpanCounter implements IBaseNestedCounter{
  nestedCounter: BaseNestedCounter|BaseSpanCounter;
  /** true 時計數底層的 counter 次數 */
  countNested: boolean = false;
  protected constructor(option: {
    maxTimes: number,
    period: number,
    nestedCounter: BaseNestedCounter|BaseSpanCounter,
    storeKey: string,
    countNested?: boolean,
  }) {
    super({
      maxTimes: option.maxTimes,
      span: option.period,
      storeKey: option.storeKey,
    });
    this.nestedCounter = option.nestedCounter;
    this.countNested = option.countNested ?? false;
  }

  /**
   * @extendSummary -
   *  其 counter start or not 考慮到 spanCounter 於以下情況
   *  - CounterStage.counting
   *    period counter 不做任何事
   *  - CounterStage.startNewCount
   *    period counter 啓動 new counter
   *  - CounterStage.exceedMaxRetries
   *    重置並啓動 spanCounter, 並開始新的 periodCounter
   * */
  start(): CounterStage[] {
    let periodStage = super.start();
    if (periodStage[0] == CounterStage.exceedMaxRetries)
      return periodStage;

    let spanStage = this.nestedCounter.start();
    const startPeriodAndRestartSpan = periodStage[0] == CounterStage.startNewCount && spanStage[0] == CounterStage.exceedMaxRetries;
    const continuePeriodAndBlockSpan = periodStage[0] == CounterStage.counting && spanStage[0] == CounterStage.exceedMaxRetries;

    if (startPeriodAndRestartSpan){
      this.nestedCounter.reset();
      spanStage = this.nestedCounter.start();
    } else if (continuePeriodAndBlockSpan){
    }

    const ret = [...periodStage, ...spanStage];

    if (this.countNested){
      if (ret.slice(1).indexOf(CounterStage.startNewCount) != -1){
        this.onCountNestedCounter(ret);
      }
    }
    return ret;
  }

  /** 當 {@link countNested} 為 true 且所有巢狀 counter 中有其中之一 start new counter
   * 會呼叫 {@link onCountNestedCounter}，這裡預設為計數最低層的 counter */
  protected onCountNestedCounter(stages: CounterStage[]){
    const innerMostStage = stages[stages.length -1];
    if (innerMostStage == CounterStage.startNewCount){
      if (!this.hasExceedMaxRetries.value){
        this.startCount();
      }else{
        this.didExceedMaxRetries();
      }
    }
  }

  protected didExceedMaxRetries() {
    super.didExceedMaxRetries();
    (this.nestedCounter as any).didExceedMaxRetries();
  }

  async reset() {
    this.nestedCounter.reset();
    super.reset();
  }

  continue() {
    this.nestedCounter.continue();
    super.continue();
  }

  cancel() {
    this.nestedCounter.cancel();
    super.cancel();
  }

  protected canStartNewSpan(): boolean {
    return true;
  }


}

