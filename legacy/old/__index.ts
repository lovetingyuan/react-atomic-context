/**
 * 优化过的context，可以单独读写value的每个属性而不会引起全量的重渲染
 */

import React from 'react';
import type {
  AtomicContextType,
  AtomsType,
  ContextsType,
  OnChange,
  RootValue,
  StateFunc,
} from './types';

export function useAtomicContext<T extends Record<string, unknown>>({
  _contexts,
  _atomicContext,
}: AtomicContextType<T>) {
  const { atoms } = React.useContext(_atomicContext);
  if (!atoms) {
    throw new Error('components using atomic-context must be wrapped by the Provider.');
  }
  return React.useMemo(() => {
    const obj = Object.create(null) as AtomsType<T>;
    Object.keys(_contexts).forEach((key) => {
      Object.defineProperty(obj, key, {
        get() {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          return React.useContext(_contexts[key]).atom;
        },
      });
    });
    Object.freeze(obj);
    return obj;
  }, [_contexts]);
}

// 如果只是写入状态而不关心其变化则用这个hook，仅用于必要的优化
export function useWriteAtomicContext<T extends Record<string, unknown>>({
  _atomicContext,
}: AtomicContextType<T>) {
  const { atoms } = React.useContext(_atomicContext);
  if (!atoms.current) {
    throw new Error('components using atomic-context must be wrapped by the Provider.');
  }
  return atoms.current;
}

// 用来获取当前context的值，仅用于开发调试
export function useInspectAtomicContext<T extends Record<string, unknown>>({
  _atomicContext,
}: AtomicContextType<T>) {
  const { getContextValue } = React.useContext(_atomicContext);
  return getContextValue;
}

// 创建一个context，必须传入初始值
export function createAtomicContext<T extends Record<string, unknown>>(initValue: T) {
  Object.seal(initValue);
  const contexts = Object.create(null) as ContextsType<T>;
  const allKeys = Object.keys(initValue) as (keyof T)[];
  for (const key of allKeys) {
    contexts[key] = React.createContext<any>(null);
    if (typeof key === 'string') {
      contexts[key].displayName = key + 'Context';
    }
  }
  Object.freeze(contexts);

  const AtomicContext = React.createContext<RootValue<T>>({
    atoms: React.createRef<AtomsType<T>>(),
    contextValue: React.createRef<T>(),
    getDefaultValue() {
      return initValue;
    },
    getContextValue() {
      return initValue;
    },
  });
  AtomicContext.displayName = 'AtomicContext';

  const AtomProvider = React.memo(
    (
      props: React.PropsWithChildren<{
        keyName: keyof T;
        onChangeRef: React.RefObject<OnChange<T> | undefined>;
      }>,
    ) => {
      const key = props.keyName;
      const { atoms, contextValue } = React.useContext(AtomicContext);
      const atom = useGetSetState(contextValue.current![key], (value, oldValue) => {
        contextValue.current![key] = value;
        props.onChangeRef.current?.({ key, value, oldValue }, contextValue.current!);
      });
      atoms.current![key] = atom;
      // atom保证不变化（声明依赖时要先计算然后声明计算后的值）
      const val = React.useMemo(() => ({ atom }), [atom()]);
      return React.createElement(contexts[key].Provider, { value: val }, props.children);
    },
  );

  function Provider(
    props: React.ProviderProps<T> & {
      onChange?: OnChange<T>;
    },
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
      const invalidKey = keys.find((k) => !(k in contexts));
      if (invalidKey) {
        throw new Error(
          `property "${String(
            invalidKey,
          )}" does not exist in the initial value passed to createAtomicContext.`,
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

    const atomsRef = React.useRef({} as AtomsType<T>);
    const onChangeRef = React.useRef(props.onChange);
    onChangeRef.current = props.onChange;
    let provider = props.children;
    for (const key of keys) {
      provider = React.createElement(
        AtomProvider,
        {
          keyName: key,
          onChangeRef,
        },
        provider,
      );
      // // eslint-disable-next-line react-hooks/rules-of-hooks
      // const atom = useGetSetState<T[keyof T]>(currentValue[key], (value, oldValue) => {
      //   valueRef.current[key] = value;
      //   props.onChange?.({ key, value, oldValue }, valueRef.current);
      // });
      // atomsRef.current[key] = atom;
      // // atom保证不变化（声明依赖时要先计算然后声明计算后的值）
      // // eslint-disable-next-line react-hooks/rules-of-hooks
      // const val = React.useMemo(() => ({ atom }), [atom()]);
      // provider = React.createElement(contexts[key].Provider, { value: val }, provider);
    }
    const rootValue = React.useMemo<RootValue<T>>(() => {
      return {
        atoms: atomsRef,
        contextValue: valueRef,
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
    _contexts: contexts,
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

// 支持同时读写状态的hook
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
