import {is} from "~/appCommon/extendBase/impls/utils/typeInferernce";

import {AtLeastOne, watch, watchEffect} from "~/appCommon/base/vueTypes";
import {NotImplementedError} from "~/appCommon/base/baseExceptions";
import {Optional} from "~/appCommon/base/baseApiTypes";



type TWatchAndStorePicker<T> = {
  omits: Partial<keyof T>[],
  pick: Partial<keyof T>[],
}

type TWatchAndStore<T> = {
  unwrapRef: Partial<T>,
  defaults?: T,
  storage: Storage,
  storeIdent: string,
  loadOnInitialize: boolean,
  onLoadVal?: (key: string, value: any)=>void,
} & AtLeastOne<TWatchAndStorePicker<T>>



export class WatchAndStore<T extends object> {
  propsToWatch: (keyof T)[];

  constructor(public option: TWatchAndStore<T>){
    const {unwrapRef, omits, pick, storage, storeIdent, loadOnInitialize, defaults} = option;
    const keys: (keyof T)[] = Object.keys(unwrapRef) as (keyof T)[];
    this.propsToWatch = [];

    if (is.initialized(omits)){
      this.propsToWatch = keys.filter((_)=> !omits!.includes(_ as any));

    }else if (is.initialized(pick)){
      this.propsToWatch = keys.filter((_)=> pick!.includes(_ as any))
    }

    if (loadOnInitialize){
      this.propsToWatch.forEach((element) => {
        // note: 當存入的值為 undefined 或 JSON.parse 錯誤時 ...
        try{
          const val = this.getItem(element) ?? defaults?.[element as keyof typeof unwrapRef] ?? undefined;
          unwrapRef[element as keyof typeof unwrapRef] = val
          option.onLoadVal?.(element as string, val);
        }catch(e){
          unwrapRef[element as keyof typeof unwrapRef] = undefined;
        }
      });
    }

    this.propsToWatch.forEach((element) => {
      watch(()=>unwrapRef[element as keyof typeof unwrapRef], ()=>{
        const state = unwrapRef[element as keyof typeof unwrapRef];
        storage.setItem(`${storeIdent}_${element}`, JSON.stringify(state));
      })
    });
  }

  // untested:
  getPropKey(prop: keyof T){
    return `${this.option.storeIdent}_${prop}`;
  }

  // untested:
  getItem(prop: keyof T): Optional<T[keyof T]>{
    try{
      return JSON.parse(this.option.storage.getItem(this.getPropKey(prop)) as string);
    } catch(e){
      return undefined;
    }
  }

  // untested:
  clearAll(){
    this.propsToWatch.forEach((element) => {
      this.clearProp(element);
    })
  }

  // untested:
  clearProp(prop: keyof T){
    this.option.storage.removeItem(this.getPropKey(prop));
  }
}


/** 僅用於非敏感資料，如 UI 狀態，user data可能需要整包加密
 *  所以使用 json dump {@link WebStorageService} 方式
 * */
export function watchAndStore<T extends object>(option: TWatchAndStore<T>): WatchAndStore<T>{
  return new WatchAndStore(option);
}

