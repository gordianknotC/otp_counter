import {BaseSpanCounter, CounterStage,} from "~/appCommon/counter/counters_span";
import {IBasePeriodCounter} from "~/appCommon/counter/counters_period_typedef";


type TPeriodCounterOption = {
  span: number,
  period: number,
  maxTimesPerSpan: number,
}

/** {@inheritDoc BaseSpanCounter}
 *
 * */
export
abstract class BasePeriodCounter extends BaseSpanCounter implements IBasePeriodCounter{
  spanCounter: BaseSpanCounter;

  protected constructor(option: {
    maxTimes: number,
    period: number,
    spanCounter: BaseSpanCounter,
    storeKey: string
  }) {
    super({
      maxTimes: option.maxTimes,
      span: option.period,
      storeKey: 'PeriodCounter',
    });
    this.spanCounter = option.spanCounter;
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
  start(): CounterStage {
    const periodStage = super.start();
    const spanStage = this.spanCounter.start();
    const startPeriodAndRestartSpan = periodStage == CounterStage.startNewCount && spanStage == CounterStage.exceedMaxRetries;
    const continuePeriodAndBlockSpan = periodStage == CounterStage.counting && spanStage == CounterStage.exceedMaxRetries;
    if (startPeriodAndRestartSpan){
      this.spanCounter.reset();
      this.spanCounter.start();
    } else if (continuePeriodAndBlockSpan){

    }
    return periodStage;
  }

  async reset() {
    this.spanCounter.reset();
    super.reset();
  }

  continue() {
    this.spanCounter.continue();
    super.continue();
  }

  cancel() {
    this.spanCounter.cancel();
    super.cancel();
  }

  protected onStartNewSpan(): boolean {
    return true;
  }

  protected onExceedMaxRetries() {
    super.onExceedMaxRetries();
  }
}

