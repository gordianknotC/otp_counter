<template lang="pug">
section.p-4
  section.my-2
    h2.font-bold.text-xl.my-2 VerifyOTPPeriodCounter
    p.text-sm 於 period({{COUNTER.PERIOD}}) 可進行 {{COUNTER.PERIOD_RETRIES}} 次倒數
    p.text-sm 於 span({{COUNTER.SPAN}}) 可進行 {{COUNTER.SPAN_RETRIES}} 次倒數
  h2.font-bold.text-xl.my-2 period counter
  pre counter        : {{periodCounterText}}
  pre retires        : {{periodCounter.state.retries}}
  pre max retries    : {{periodCounter.state.maxTimes}}
  pre exceed retries : {{periodCounter.hasExceedMaxRetries.value}}
  pre enabled        : {{periodCounter.counterEnabled}}
  h2.font-bold.text-xl.my-2 span counter
  pre counter     : {{peiord_spanCounterText}}
  pre retires     : {{periodCounter.spanCounter.state.retries}}
  pre max retries : {{periodCounter.spanCounter.state.maxTimes}}
  pre exceed retries : {{periodCounter.spanCounter.hasExceedMaxRetries.value}}
  pre enabled        : {{periodCounter.spanCounter.counterEnabled}}
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
    h2.font-bold.text-xl.my-2 VerifyOTPSpanCounter
    p.text-sm 於 span({{COUNTER.SPAN}}) 可進行 {{COUNTER.SPAN_RETRIES}} 次倒數
  h2.font-bold.text-xl.my-2 span counter
  pre counter     : {{spanCounterText}}
  pre retires     : {{spanCounter.state.retries}}
  pre max retries : {{spanCounter.state.maxTimes}}
  pre exceed retries: {{spanCounter.hasExceedMaxRetries.value}}
  pre enabled       : {{spanCounter.counterEnabled}}
  section.py-4
    van-button(@click="span_restart")
      span.text restart
    van-button(@click="span_reset")
      span.text reset
    van-button(@click="span_start")
      span.text start
    van-button(@click="span_continuum")
      span.text continuum


</template>

<script lang="ts">
import { ComputedRef, defineComponent, ref, watch } from "vue";
import {VerifOTPSpanCounter, VerifyOTPPeriodCounter} from "~/store/counter/counter";
import {computed, onMounted} from "~/appCommon/base/vueTypes";
import {APP_CONFIGS} from "~/config";


export default defineComponent({
  name: "CounterDemo",
  components: {
  },
  setup() {
    APP_CONFIGS.DEFAULT_MODELS.COUNTER.SPAN = 10;
    APP_CONFIGS.DEFAULT_MODELS.COUNTER.SPAN_RETRIES = 2;
    APP_CONFIGS.DEFAULT_MODELS.COUNTER.PERIOD = 30;
    APP_CONFIGS.DEFAULT_MODELS.COUNTER.PERIOD_RETRIES = 3;

    const periodCounter = new VerifyOTPPeriodCounter();
    const spanCounter = new VerifOTPSpanCounter("yoyo");

    const periodCounterText = computed(()=>{
      const text =  periodCounter.currentCounter.value;
      const enabled =  periodCounter.counterEnabled.value;
      if (enabled)
        return `(${text})`;
      return "";
    });

    const peiord_spanCounterText = computed(()=>{
      const text =  periodCounter.spanCounter.currentCounter.value;
      const enabled =  periodCounter.spanCounter.counterEnabled.value;
      if (enabled)
        return `(${text})`;
      return "";
    });

    const spanCounterText = computed(()=>{
      const text =  spanCounter.currentCounter.value;
      const enabled =  spanCounter.counterEnabled.value;
      if (enabled)
        return `(${text})`;
      return "";
    });

    const init = ()=>{
      console.group("MOUNT");
      if (periodCounter.counterEnabled.value){
        console.log("continue");
        periodCounter.continue();
      }else if (periodCounter.hasExceedMaxRetries.value){
        console.log("restart...");
        periodCounter.reset();
        periodCounter.start();
      }else{
        console.log("start");
        periodCounter.start();
      }
      console.groupEnd();
    }

    //@ts-ignore
    window.counter = periodCounter;
    onMounted(()=>{
      init();
    });

    return {
      COUNTER: APP_CONFIGS.DEFAULT_MODELS.COUNTER,
      periodCounter,
      spanCounter,
      periodCounterText,
      spanCounterText,
      peiord_spanCounterText,
      restart(){
        periodCounter.reset();
        periodCounter.start();
      },
      reset(){
        periodCounter.reset();
      },
      start(){
        periodCounter.start();
      },
      continuum(){
        periodCounter.continue();
      },
      //
      //
      span_restart(){
        spanCounter.reset();
        spanCounter.start();
      },
      span_reset(){
        spanCounter.reset();
      },
      span_start(){
        spanCounter.start();
      },
      span_continuum(){
        spanCounter.continue();
      }
    };
  }
});
</script>

<style lang="scss" scoped>

</style>
