import {BaseSpanCounter, CounterStage} from "~/appCommon/counter/counters_span";
import {BaseNestedCounter} from "~/appCommon/counter/counters_period";


/** example email counter */

export class VerifEmailSpanCounter extends  BaseSpanCounter{
  constructor(key: string = 'EmailSpanCounter') {
    super({
      maxTimes: 2,
      span:     10,
      storeKey: key
    });
  }
  protected afterCancel(): void {}
  protected afterSet(lbound: number): void {}
}

export class VerifyEmailCounter extends BaseNestedCounter{
  constructor(key: string = 'EmailCounter') {
    super({
      maxTimes:  3,
      period: 30,
      nestedCounter: new VerifEmailSpanCounter(),
      storeKey: key,
    });
    console.log("Period:", this.state.span, "option:");

  }

  protected afterCancel(): void {}
  protected afterSet(lbound: number): void {}
}






/** example otp counter */

export class VerifOTPSpanCounter extends  BaseSpanCounter{
  constructor(key: string = 'VerifOTPSpanCounter') {
    super({
      maxTimes: 0,
      span:     1,
      storeKey: key
    });
  }
  protected afterCancel(): void {}
  protected afterSet(lbound: number): void {}
}

export class VerifyOTPPeriodCounter extends BaseNestedCounter{
  constructor(key: string = 'VerifyOTPPeriodCounter') {
    super({
      maxTimes:  0,
      period: 12,
      nestedCounter: new VerifOTPSpanCounter(),
      storeKey: key,
    });
  }

  protected afterCancel(): void {}
  protected afterSet(lbound: number): void {}
}

export class VerifyOTPCounter extends BaseNestedCounter{
  constructor(key: string = 'VerifyOTPCounter') {
    super({
      maxTimes:  9,
      period: 60 * 60,
      nestedCounter: new VerifyOTPPeriodCounter(),
      storeKey: key,
      countNested: true,
    });
  }
  protected afterCancel(): void {}
  protected afterSet(lbound: number): void {}
}
