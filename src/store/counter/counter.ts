import {BaseSpanCounter} from "~/appCommon/counter/counters_span";
import {BasePeriodCounter} from "~/appCommon/counter/counters_period";
import {APP_CONFIGS} from "~/config";


export class VerifOTPSpanCounter extends  BaseSpanCounter{
  constructor() {
    super({
      maxTimes: APP_CONFIGS.DEFAULT_MODELS.COUNTER.SPAN_RETRIES,
      span:     APP_CONFIGS.DEFAULT_MODELS.COUNTER.SPAN,
      storeKey: 'VerifOTPSpanCounter'
    });
  }
  protected afterCancel(): void {}
  protected afterSet(lbound: number): void {}
}

export class VerifyOTPPeriodCounter extends BasePeriodCounter{
  constructor() {
    super({
      maxTimes:  APP_CONFIGS.DEFAULT_MODELS.COUNTER.PERIOD_RETRIES,
      period: APP_CONFIGS.DEFAULT_MODELS.COUNTER.PERIOD,
      spanCounter: new VerifOTPSpanCounter(),
      storeKey: 'VerifyOTPPeriodCounter',
    });
    console.log("Period:", this.state.span, "option:");

  }

  protected afterCancel(): void {}
  protected afterSet(lbound: number): void {}
}
