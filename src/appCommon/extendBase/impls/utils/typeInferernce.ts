import {Optional} from "~/appCommon/base/baseApiTypes";

export class Is {
  /**
   * 用於 type class, 有 constructor name 無法分辦
   *   1) generic class
   *   2) 非 class object (沒有 constructor name者）
   *      小心使用
   *   e.g:
   *    > is.type([], "Object") // false 讀 constructor.name
   *    > is.type([], "Array")  // true 讀 constructor.name
   *    > is.type({}, "Object") // true 讀 constructor.name
   *
   * */
  type(val: Optional<any>, name: string): boolean {
    return (val?.constructor?.name == name);
  }

  true(val: any): boolean {
    return val === true;
  }

  array(val: any): boolean {
    if (typeof val === "object"){
      if (val.length === undefined || val.length === null){
        return false;
      }
      if (typeof val === "number"){
        return true;
      }
      return false;
    }
    return false;
  }

  string(val: any): boolean {
    return typeof val == "string";
  }

  number(val: any): boolean {
    return typeof val == "number";
  }

  // @param: countUndefinedString
  //         考處 string 值為 "undefined" 也算在內
  //
  undefined(val: any, countUndefinedString: boolean = false): boolean {
    if (countUndefinedString) {
      return typeof val == undefined || val == "undefined";
    }
    return val == undefined;
  }

  // @param: countNullString
  //         考處 string 值為 "null" 也算在內
  //
  null(val: any, countNullString: boolean = false): boolean {
    if (countNullString)
      return val === "null" || val == null;
    return val == null;
  }

  // 不是 null 也不是 undefined, 己初始化
  initialized(val: any): boolean {
    return !this.null(val) && !this.undefined(val);
  }

  // 是否為空，「不包含」0， true, false
  // 以下為 empty
  // - null
  // - undefined
  // - NaN
  // - empty string ("")
  // - {}
  // - []
  // 不包含
  // - false
  // - 0
  empty(val: any): boolean {
    if (val === undefined || val === null){
      return true;
    }
    if (val === 0 || val === false || val === true){
      return false;
    }
    if (typeof val === "object") {
      const propNames = Object.getOwnPropertyNames(val);
      if (propNames.includes("length"))
        return val.length === 0;

      if (val.constructor.name === "Object" && propNames.length == 0)
        return true;

      return false;
    } else {
      if (val) {
        return false;
      }
      return true;
    }
  }


  // is.not
  get not(): IsNot {
    return isnot;
  }

  get mobile(): boolean{
    return Is._mobile ??= /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  private static _mobile: boolean;
}

export const is: Is = new Is();


class IsNot {
  type(val: any, name: string): boolean {
    return !is.type(val, name);
  }

  undefined(val: any, countUndefinedString: boolean = false): boolean {
    return !is.undefined(val, countUndefinedString);
  }

  null(val: any, countNullString: boolean = false): boolean {
    return !is.null(val, countNullString);
  }

  initialized(val: any): boolean {
    return !is.initialized(val);
  }

  empty(val: any): boolean {
    return !is.empty(val);
  }

  array(val: any): boolean {
    return !is.array(val);
  }

  string(val: any): boolean {
    return !is.string(val);
  }
}

const isnot = new IsNot();
