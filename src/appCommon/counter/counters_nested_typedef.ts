import {IBaseSpanCounter} from "~/appCommon/counter/counters_span_typedef";

export
interface IBaseNestedCounter extends IBaseSpanCounter{
  nestedCounter: IBaseNestedCounter|IBaseSpanCounter;
}
