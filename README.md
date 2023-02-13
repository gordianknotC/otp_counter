# OTP Counter

![](.README_images/34154168.png)

[demo](https://gordianknotc.github.io/otp_counter/)

由二種 counter 組成
- BaseNestedCounter 
- BaseSpanCounter

BaseNestedCounter 繼承 BaseNestedCounter，內可巢狀一個 BaseSpanCounter | BaseNestedCounter, 當 BaseSpanCounter 巢狀於 BaseNestedCounter 下時，BaseSpanCounter 得以被 BaseNestedCounter 重設，BaseNestedCounter 繼承了 BaseSpanCounter 的基本邏輯， 雙重 counter 設計用於多重 counter 條件，基本定義如下：

> __定義:__
>
> 於 period 其間可進行 pt 次倒數, 
> 於 span 其間可進行 st 次倒數, 
> 當 span 巢狀於 period 下時，
> span 重試次數得以被 period 重設, 
> 因此當 period 再次計數後 span 重設。


__實例 email counter:__
5分鐘可重試5次，每次間隔 10 秒內，若以 BaseNestedCounter/BaseSpanCounter 組合，其設定如下：
- BaseNestedCounter -  period 5min， maxRetries 1
  - BaseSpanCounter - span 10s， maxRetries 5


__實例 otp counter:__
於 3分鐘可重試3次，每次間隔 10 秒內，一天最多9次, 若以 BaseNestedCounter/BaseSpanCounter 組合，其設定如下：
- BaseSumCounter 間隔 1d，maxRetries 9
  - BaseNestedCounter 間隔 3min，maxRetries INFINITY
    - BaseSpanCounter 間隔 span 10s， maxRetries 3


## Feature
- counter 當前狀態會即時寫入 browser local storage, 重刷不影嚮 counter 狀態，除非清除 local storage
- BaseSpanCounter
  可設定 counter 於 span 秒內重試 St 次
- BaseNestedCounter
  可設定 counter 於 period 秒內重試 St 次, 並可巢狀一個 BaseSpanCounter|BaseNestedCounter, 當母層計數完後，子層計數重設

## Examples:
### EmailCounter
```ts
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
```

```vue
<template lang="pug">
section.p-4
  section.my-2
    h2.font-bold.text-xl.my-2 EmailCounter
  h2.font-bold.text-lg.my-2 NestedCounter
  pre counter        : {{emailCounterText}}
  pre retires        : {{emailCounter.state.retries}}
  pre max retries    : {{emailCounter.state.maxTimes}}
  pre exceed retries : {{emailCounter.hasExceedMaxRetries.value}}
  pre enabled        : {{emailCounter.counterEnabled}}
  h2.font-bold.text-lg.my-2 SpanCounter
  pre counter     : {{emailSubCounterText}}
  pre retires     : {{emailCounter.nestedCounter.state.retries}}
  pre max retries : {{emailCounter.nestedCounter.state.maxTimes}}
  pre exceed retries : {{emailCounter.nestedCounter.hasExceedMaxRetries.value}}
  pre enabled        : {{emailCounter.nestedCounter.counterEnabled}}
  section.py-4
    van-button(@click="restart")
      span.text restart
    van-button(@click="reset")
      span.text reset
    van-button(@click="start")
      span.text start
    van-button(@click="continuum")
      span.text continuum
</template>

<script lang="ts">
import { ComputedRef, defineComponent, ref, watch } from "vue";
import {VerifEmailSpanCounter, VerifyEmailCounter, VerifyOTPCounter, VerifyOTPPeriodCounter} from "~/store/counter/counter";
import {computed, onMounted} from "~/appCommon/base/vueTypes";
import {BaseNestedCounter} from "~/appCommon/counter/counter_nested";

export default defineComponent({
  name: "CounterDemo",
  components: {
  },
  setup() {
    const emailCounter = new VerifyEmailCounter();
    const emailCounterText = computed(()=>{
      const text =  emailCounter.currentCounter.value;
      const enabled =  emailCounter.counterEnabled.value;
      if (enabled)
        return `(${text})`;
      return "";
    });

    const emailSubCounterText = computed(()=>{
      const text =  emailCounter.nestedCounter.currentCounter.value;
      const enabled =  emailCounter.nestedCounter.counterEnabled.value;
      if (enabled)
        return `(${text})`;
      return "";
    });

    const init = (counter: BaseNestedCounter)=>{
      console.group("MOUNT");
      if (counter.counterEnabled.value){
        console.log("continue");
        counter.continue();
      }else if (counter.hasExceedMaxRetries.value){
        console.log("restart...");
        counter.reset();
        counter.start();
      }else{
        console.log("start");
        counter.start();
      }
      console.groupEnd();
    }

    onMounted(()=>{
      init(emailCounter);
    });

    return {
      emailCounter,
      emailCounterText,
      emailSubCounterText,
      restart(){
        emailCounter.reset();
        emailCounter.start();
      },
      reset(){
        emailCounter.reset();
      },
      start(){
        emailCounter.start();
      },
      continuum(){
        emailCounter.continue();
      },
    };
  }
});
</script>
```



### OTPCounter
```ts



/** example otp counter */
export class VerifOTPSpanCounter extends  BaseSpanCounter{
  constructor(key: string = 'VerifOTPSpanCounter') {
    super({
      /** 0 代表無限大 */
      maxTimes: 3,
      span:     10,
      storeKey: key
    });
  }
  protected afterCancel(): void {}
  protected afterSet(lbound: number): void {}
}

export class VerifyOTPPeriodCounter extends BaseNestedCounter{
  constructor(key: string = 'VerifyOTPPeriodCounter') {
    super({
      /** 0 代表無限大 */
      maxTimes:  0,
      period: 60 * 3,
      nestedCounter: new VerifOTPSpanCounter(),
      storeKey: key,
    });
  }

  protected afterCancel(): void {}
  protected afterSet(lbound: number): void {}
}

/** BaseSumCounter 計數底層次數, 行為模式不太一樣  */
export class VerifyOTPCounter extends BaseSumCounter{
  constructor(key: string = 'VerifyOTPCounter') {
    super({
      maxTimes:  9,
      period: 60 * 60,
      nestedCounter: new VerifyOTPPeriodCounter(),
      storeKey: key,
    });
  }
  protected afterCancel(): void {}
  protected afterSet(lbound: number): void {}
}
```


```vue
<template lang="pug">
section.p-4
  section.my-2
    h2.font-bold.text-xl.my-2 OTPCounter
  h2.font-bold.text-lg.my-2 BaseSumCounter
  pre counter        : {{otpCounterText}}
  pre retires        : {{otpCounter.state.retries}}
  pre max retries    : {{otpCounter.state.maxTimes}}
  pre exceed retries : {{otpCounter.hasExceedMaxRetries.value}}
  pre enabled        : {{otpCounter.counterEnabled}}
  h2.font-bold.text-lg.my-2 NestedCounter
  pre counter     : {{otpSubCounterText}}
  pre retires     : {{otpCounter.nestedCounter.state.retries}}
  pre max retries : {{otpCounter.nestedCounter.state.maxTimes}}
  pre exceed retries : {{otpCounter.nestedCounter.hasExceedMaxRetries.value}}
  pre enabled        : {{otpCounter.nestedCounter.counterEnabled}}
  h2.font-bold.text-lg.my-2 SpanCounter
  pre counter     : {{otpSubSubCounterText}}
  pre retires     : {{otpCounter.nestedCounter.nestedCounter.state.retries}}
  pre max retries : {{otpCounter.nestedCounter.nestedCounter.state.maxTimes}}
  pre exceed retries : {{otpCounter.nestedCounter.nestedCounter.hasExceedMaxRetries.value}}
  pre enabled        : {{otpCounter.nestedCounter.nestedCounter.counterEnabled}}
  section.py-4
    van-button(@click="otp_restart")
      span.text restart
    van-button(@click="otp_reset")
      span.text reset
    van-button(@click="otp_start")
      span.text start
    van-button(@click="otp_continuum")
      span.text continuum
</template>

<script lang="ts">
import { ComputedRef, defineComponent, ref, watch } from "vue";
import {VerifEmailSpanCounter, VerifyEmailCounter, VerifyOTPCounter, VerifyOTPPeriodCounter} from "~/store/counter/counter";
import {computed, onMounted} from "~/appCommon/base/vueTypes";
import {BaseNestedCounter} from "~/appCommon/counter/counter_nested";

export default defineComponent({
  name: "CounterDemo",
  components: {
  },
  setup() {
    const otpCounter = new VerifyOTPCounter();
    const otpCounterText = computed(()=>{
      const text =  otpCounter.currentCounter.value;
      const enabled =  otpCounter.counterEnabled.value;
      if (enabled)
        return `(${text})`;
      return "";
    });

    const otpSubCounterText = computed(()=>{
      const text =  otpCounter.nestedCounter.currentCounter.value;
      const enabled =  otpCounter.nestedCounter.counterEnabled.value;
      if (enabled)
        return `(${text})`;
      return "";
    });
    const otpSubSubCounterText = computed(()=>{
      const text =  (otpCounter.nestedCounter as VerifyOTPPeriodCounter).nestedCounter.currentCounter.value;
      const enabled =  (otpCounter.nestedCounter as VerifyOTPPeriodCounter).counterEnabled.value;
      if (enabled)
        return `(${text})`;
      return "";
    });


    const init = (counter: BaseNestedCounter)=>{
      console.group("MOUNT");
      if (counter.counterEnabled.value){
        console.log("continue");
        counter.continue();
      }else if (counter.hasExceedMaxRetries.value){
        console.log("restart...");
        counter.reset();
        counter.start();
      }else{
        console.log("start");
        counter.start();
      }
      console.groupEnd();
    }

    onMounted(()=>{
      init(otpCounter);
    });

    return {
      otpCounter,
      otpCounterText,
      otpSubCounterText,
      otpSubSubCounterText,
      otp_restart(){
        otpCounter.reset();
        otpCounter.start();
      },
      otp_reset(){
        otpCounter.reset();
      },
      otp_start(){
        otpCounter.start();
      },
      otp_continuum(){
        otpCounter.continue();
      }
    };
  }
});
</script>
```


## Todo
- [V] demo
- [ ] 轉為 ts package
- [ ] 單元測試  


