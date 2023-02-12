import {BaseSpanCounter, CounterStage} from "~/appCommon/counter/counters_span";
import {BasePeriodCounter} from "~/appCommon/counter/counters_period";
import {APP_CONFIGS} from "~/config";


export class VerifOTPSpanCounter extends  BaseSpanCounter{
  constructor(key: string = 'VerifOTPSpanCounter') {
    super({
      maxTimes: APP_CONFIGS.DEFAULT_MODELS.COUNTER.SPAN_RETRIES,
      span:     APP_CONFIGS.DEFAULT_MODELS.COUNTER.SPAN,
      storeKey: key
    });
  }
  protected afterCancel(): void {}
  protected afterSet(lbound: number): void {}

  // start(): CounterStage {
  //   if (this.counterEnabled.value)
  //     return CounterStage.counting;
  //   return super.start();
  // }
}

export class VerifyOTPPeriodCounter extends BasePeriodCounter{
  constructor(key: string = 'VerifyOTPPeriodCounter') {
    super({
      maxTimes:  APP_CONFIGS.DEFAULT_MODELS.COUNTER.PERIOD_RETRIES,
      period: APP_CONFIGS.DEFAULT_MODELS.COUNTER.PERIOD,
      spanCounter: new VerifOTPSpanCounter(),
      storeKey: key,
    });
    console.log("Period:", this.state.span, "option:");

  }

  protected afterCancel(): void {}
  protected afterSet(lbound: number): void {}
  // start(): CounterStage {
  //   if (this.counterEnabled.value)
  //     return CounterStage.counting;
  //   return super.start();
  // }
}
