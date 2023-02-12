<template lang="pug">
section.p-4
  section.my-2
    h2.font-bold.text-xl.my-2 PeriodCounter+SpanCounter
    p.text-sm 於 period({{COUNTER.PERIOD}}) 可進行 {{COUNTER.PERIOD_RETRIES}} 次倒數
    p.text-sm 於 span({{COUNTER.SPAN}}) 可進行 {{COUNTER.SPAN_RETRIES}} 次倒數
  hr.my-2
  h2.font-bold.text-xl.my-2 period counter
  pre counter        : {{counterText}}
  pre retires        : {{counter.state.retries}}
  pre max retries    : {{counter.state.maxTimes}}
  pre exceed retries : {{counter.hasExceedMaxRetries.value}}
  pre enabled        : {{enabled}}
  pre canResend      : {{canResend}}
  hr.my-2
  h2.font-bold.text-xl.my-2 span counter
  pre counter     : {{spanCounterText}}
  pre retires     : {{counter.spanCounter.state.retries}}
  pre max retries : {{counter.spanCounter.state.maxTimes}}

  section.py-4
    van-button(@click="restart" :disabled="!canResend")
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
import {VerifyOTPPeriodCounter} from "~/store/counter/counter";
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

    const counter = new VerifyOTPPeriodCounter();

    const counterText = computed(()=>{
      const text =  counter.currentCounter.value;
      const enabled =  counter.counterEnabled.value;
      if (enabled)
        return `(${text})`;
      return "";
    });

    const spanCounterText = computed(()=>{
      const text =  counter.spanCounter.currentCounter.value;
      const enabled =  counter.spanCounter.counterEnabled.value;
      if (enabled)
        return `(${text})`;
      return "";
    });

    const canResend = computed(()=>{
      return !counter.counterEnabled.value;
    });

    const enabled = counter.counterEnabled;

    //@ts-ignore
    window.counter = counter;
    onMounted(()=>{
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
    })    ;
    return {
      COUNTER: APP_CONFIGS.DEFAULT_MODELS.COUNTER,
      counter,
      counterText,
      spanCounterText,
      enabled,
      canResend,
      restart(){
        counter.reset();
        counter.start();
      },
      reset(){
        counter.reset();
      },
      start(){
        counter.start();
      },
      continuum(){
        counter.continue();
      }
    };
  }
});
</script>

<style lang="scss" scoped>

</style>
