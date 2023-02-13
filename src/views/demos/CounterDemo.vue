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
  br
  br
  br
</template>

<script lang="ts">
import { ComputedRef, defineComponent, ref, watch } from "vue";
import {VerifEmailSpanCounter, VerifyEmailCounter, VerifyOTPCounter, VerifyOTPPeriodCounter} from "~/store/counter/counter";
import {computed, onMounted} from "~/appCommon/base/vueTypes";
import {APP_CONFIGS} from "~/config";
import {BaseNestedCounter} from "~/appCommon/counter/counter_nested";


export default defineComponent({
  name: "CounterDemo",
  components: {
  },
  setup() {
    const emailCounter = new VerifyEmailCounter();
    const otpCounter = new VerifyOTPCounter();

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

    //@ts-ignore
    window.counter = emailCounter;
    onMounted(()=>{
      init(emailCounter);
      init(otpCounter);
    });

    return {
      emailCounter,
      otpCounter,
      emailCounterText,
      emailSubCounterText,
      otpCounterText,
      otpSubCounterText,
      otpSubSubCounterText,
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
      //
      //
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

<style lang="scss" scoped>

</style>
