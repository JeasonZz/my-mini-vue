import { isTracking, trackEffects, triggerEffects } from "./effect";
import { reactive } from "./reactivity";
import { isObject, hasChanged } from "../shared/index";
//目标就是将值类型包装成响应式，外加一些边缘case处理
class RefImpl {
  private _value: any;
  public dep;
  private _rawValue: any;
  public _is_VueRef = true;
  constructor(value) {
    //将值复制两份进行存储
    this._rawValue = value;
    //边缘case：如果传入引用类型直接转去隔壁reactive
    this._value = convert(value);
    //直接创建set集合存储引用
    this.dep = new Set();
  }
  get value() {
    trackRefValue(this);
    return this._value;
  }

  set value(newValue) {
    //判断值是否改变
    if (hasChanged(newValue, this._rawValue)) {
      this._rawValue = newValue;
      this._value = convert(newValue);
      triggerEffects(this.dep);
    }
  }
}
function trackRefValue(ref) {
  if (isTracking()) {
    trackEffects(ref.dep);
  }
}
function convert(value) {
  return isObject(value) ? reactive(value) : value;
}
export function ref(value) {
  return new RefImpl(value);
}
//判断是否为ref类型
export function isRef(ref) {
  return !!ref._is_VueRef;
}
//是ref返回ref.value,不是ref 直接返回原来的值
export function unRef(ref) {
  return isRef(ref) ? ref.value : ref;
}
//传进来一个对象，属性中有ref的值 使用场景：对象中夹杂ref类型
export function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs, {
    get(target, key) {
      return unRef(Reflect.get(target, key));
    },
    set(target, key, value) {
      //如果原本是ref类型 穿进来的不是ref类型
      if (isRef(Reflect.get(target, key)) && !isRef(value)) {
        return (target[key].value = value);
      } else {
        //原来是响应式对象直接赋值，则触发reactive劫持对象的set，nice 传进来的也是ref类型
        return Reflect.set(target, key, value);
      }
    },
  });
}
