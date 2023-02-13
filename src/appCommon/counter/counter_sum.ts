import {BaseNestedCounter} from "~/appCommon/counter/counter_nested";
import {BaseSpanCounter, CounterStage} from "~/appCommon/counter/counters_span";


/** {@inheritDoc BaseNestedCounter}
 * 為 {@link BaseNestedCounter} 只是強制 countNested 為 true
 *  用來計數底層的 counter
 * */
export
abstract class BaseSumCounter extends BaseNestedCounter{
  protected constructor(option: {
    maxTimes: number,
    period: number,
    nestedCounter: BaseNestedCounter|BaseSpanCounter,
    storeKey: string,
  }) {
    super(option);
    this.nestedCounter = option.nestedCounter;
    this.countNested = true;
  }

  protected onCountNestedCounter(stages: CounterStage[]) {
    super.onCountNestedCounter(stages);
  }
}
