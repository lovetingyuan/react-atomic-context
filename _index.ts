/**
 * 优化过的context，可以单独读写value的每个属性而不会引起全量的重渲染
 */

import React from 'react';
import type {
  AtomicContextType,
  AtomsType,
  ContextsType,
  OnChangeParam,
  RootValue,
  StateFunc,
} from './types';

export function useAtomicContext<T extends Record<string, unknown>>({
  _contexts,
  _atomicContext,
}: AtomicContextType<T>) {
  const { bootstrap } = React.useContext(_atomicContext);
  if (!bootstrap) {
    throw new Error('components using atomic-context must be wrapped by the Provider.');
  }
  return React.useMemo(() => {
    const obj = {} as {
      [k in keyof T]: StateFunc<T[k]>;
    };
    Object.keys(_contexts).forEach(key => {
      Object.defineProperty(obj, key, {
        get() {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          return React.useContext(_contexts[key as string]).atom;
        },
      });
    });
    return obj;
  }, [_contexts]);
}

// 如果只是写入状态而不关心其变化则用这个hook，仅用于必要的优化
export function useWriteAtomicContext<T extends Record<string, unknown>>({
  _atomicContext,
}: AtomicContextType<T>) {
  const { bootstrap, atoms } = React.useContext(_atomicContext);
  if (!bootstrap) {
    throw new Error('components using atomic-context must be wrapped by the Provider.');
  }
  return atoms!.current;
}

// 用来获取当前context的值，仅用于开发调试
export function useInspectAtomicContext<T extends Record<string, unknown>>({
  _atomicContext,
}: AtomicContextType<T>) {
  const { getContextValue } = React.useContext(_atomicContext);
  return getContextValue;
}

export function createAtomicContext<T extends Record<string, unknown>>(initValue: T) {
  Object.seal(initValue);
  const ctxs = {} as ContextsType<T>;
  const allKeys = Object.keys(initValue) as (keyof T)[];
  for (const key of allKeys) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ctxs[key] = React.createContext<any>(null);
    if (typeof key === 'string') {
      ctxs[key].displayName = key + 'Context';
    }
  }

  const AtomicContext = React.createContext<RootValue<T>>({
    bootstrap: false,
    atoms: null,
    getDefaultValue() {
      return initValue;
    },
    getContextValue() {
      return initValue;
    },
  });
  AtomicContext.displayName = 'AtomicContext';

  function Provider(
    props: React.ProviderProps<T> & {
      onChange?: (p: OnChangeParam<T>, v: T) => void;
    }
  ) {
    const initValueRef = React.useRef(props.value);
    if (initValueRef.current !== props.value) {
      throw new Error('"value" passed to Provider can not be changed, please use useMemo.');
    }
    const keys = React.useMemo(() => {
      if (Object.prototype.toString.call(props.value) !== '[object Object]') {
        throw new Error('"value" prop is required for Provider component.');
      }
      const keys = Object.keys(props.value) as (keyof T)[];
      if (keys.length === 0) {
        throw new Error('"value" passed to Provider component can not be empty object.');
      }
      const invalidKey = keys.find(k => !(k in ctxs));
      if (invalidKey) {
        throw new Error(
          `property "${String(
            invalidKey
          )}" does not exist in the initial value passed to createAtomicContext.`
        );
      }
      return keys;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const currentValue = props.value;

    const valueRef = React.useRef<T>(currentValue);
    if (valueRef.current === currentValue) {
      valueRef.current = { ...currentValue };
    }

    const atoms = React.useRef({} as AtomsType<T>);

    let provider = props.children;
    for (const key of keys) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      atoms.current[key] = useGetSetState<T[keyof T]>(currentValue[key], (value, oldValue) => {
        valueRef.current[key] = value;
        props.onChange?.({ key, value, oldValue }, valueRef.current);
      });
      const atom = atoms.current[key];
      // atom保证不变化（声明依赖时要先计算然后声明计算后的值）
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const val = React.useMemo(() => ({ atom }), [atom()]);
      provider = React.createElement(ctxs[key].Provider, { value: val }, provider);
    }
    const rootValue = React.useMemo<RootValue<T>>(() => {
      return {
        bootstrap: true,
        atoms,
        getDefaultValue() {
          return initValue;
        },
        getContextValue() {
          return valueRef.current;
        },
      };
    }, []);
    return React.createElement(AtomicContext.Provider, { value: rootValue }, provider);
  }

  return {
    Provider,
    _contexts: ctxs,
    _atomicContext: AtomicContext,
    get displayName() {
      return AtomicContext.displayName;
    },
    set displayName(n) {
      AtomicContext.displayName = n;
    },
    _currentValue: initValue,
    typeof: '$AtomicContext' as const,
  };
}

function useGetSetState<D>(data: D, onChange?: (v: D, ov: D) => void) {
  const [val, setVal] = React.useState(data);
  const currentValRef = React.useRef(val);
  currentValRef.current = val;
  const changeRef = React.useRef<((v: D, ov: D) => void) | undefined>(onChange);
  changeRef.current = onChange;
  return React.useCallback((...args: [D] | []) => {
    if (args.length) {
      setVal(args[0]);
      if (changeRef.current) {
        changeRef.current(args[0], currentValRef.current);
      }
    } else {
      return currentValRef.current;
    }
  }, []) as StateFunc<D>;
}
