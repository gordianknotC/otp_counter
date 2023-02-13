# OTP Counter
由二種 counter 組成，NestedCounter 內可巢狀一個 SpanCounter|NestedCounter, 
二種 Counter 都繼承 BaseSpanCounter，設計用於雙重 counter 條件，如

> __定義:__
>
> 於 period 其間可進行 pt 次倒數, 於 span 其間可進行 st 次倒數, 當 period 再次計數後 span 重設, 
>


__實例:__
- otp counterA, 於 30分鐘可重試3次，每次間隔 10 秒內，一天最多9次
  - NestedCounter 間隔 1d，maxRetries 1
    - NestedCounter 間隔 30min，maxRetries 9
      - SpanCounter 間隔 span 10s， maxRetries 3

- otp counterB, 於 30分鐘可重試5次，每次間隔 10 秒內，一天最多9次
  - NestedCounter 間隔 1d，maxRetries 1
    - NestedCounter 間隔 30min，maxRetries 5
      - SpanCounter 間隔 span 10s， maxRetries infinity
      
- email counter, 5分鐘可重試5次，每次間隔 10 秒內
  - NestedCounter 間隔 period 5min， maxRetries 1
    - SpanCounter 間隔 span 10s， maxRetries 5


## SafeInterval


## BaseSpanCounter
### SpanCounter

## BasePeriodCounter
### PeriodCounter




