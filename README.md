# OTP Counter
由二種 counter 組成，PeriodCounter 內巢狀一個 SpanCounter, 
二種 Counter 都繼承 BaseSpanCounter，設計用於隻重 counter 條件，如

> 於 SpanCounter 其間內可計數 Ss 次，每次需間隔 St 秒，於 
> PeriodCounter 其間可再次重試 Pt 次，每次間隔  Pt 秒

__實例如 otp counter:__
> 可重試 


## SafeInterval


## BaseSpanCounter
### SpanCounter

## BasePeriodCounter
### PeriodCounter




