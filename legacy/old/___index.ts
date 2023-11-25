/**
 * 优化过的context，可以单独读写value的每个属性而不会引起全量的重渲染
 */

import React from 'react';

type GetSetKey<K, O extends 'get' | 'set'> = K extends `${infer L}${infer R}`
  ? `${O}${Uppercase<L>}${R}`
  : never;

export type GettersType<T extends Record<string, unknown>> = {
  [k in keyof T]: () => T[k];
};

export type SettersType<T extends Record<string, unknown>> = {
  [k in keyof T]: (v: T[k]) => void;
};

export type AtomContextValueType<T extends Record<string, unknown>> = Omit<
  T & {
    [k in keyof T as GetSetKey<k, 'get'>]: () => T[k];
  } & {
    [k in keyof T as GetSetKey<k, 'set'>]: (v: T[k]) => void;
  },
  ''
>;

export type RootValue<T extends Record<string, unknown>> = {
  getters: React.RefObject<GettersType<T>>;
  setters: React.RefObject<SettersType<T>>;
  contextValue: React.RefObject<T>;
  getDefaultValue: () => T;
  getContextValue: () => T;
};

export type OnChange<T extends Record<string, unknown>> = (
  p: {
    [K in keyof T]: { key: K; value: T[K]; oldValue: T[K] };
  }[keyof T],
  v: T
) => void;

export type ContextsType<T extends Record<string, unknown>> = {
  [k in keyof T]: React.Context<T[k]>;
};

export interface AtomicContextType<T extends Record<string, unknown>> {
  _contexts: ContextsType<T>;
  displayName?: string;
  _atomicContext: React.Context<RootValue<T>>;
  _currentValue: T;
  // Provider: React.Component;
  typeof: '$AtomicContext';
}

export function useAtomicContext<T extends Record<string, unknown>>({
  _contexts,
  _atomicContext,
}: AtomicContextType<T>) {
  const { getters, setters } = React.useContext(_atomicContext);
  if (!setters || !getters) {
    throw new Error('components using atomic-context must be wrapped by the Provider.');
  }
  return React.useMemo(() => {
    const getterSetters: Record<string, any> = {};
    const _getters = getters.current!;
    const _setters = setters.current!;
    Object.keys(_getters).forEach(k => {
      getterSetters[`get${k[0].toUpperCase()}${k.slice(1)}`] = _getters[k];
    });
    Object.keys(_setters).forEach(k => {
      getterSetters[`set${k[0].toUpperCase()}${k.slice(1)}`] = _setters[k];
    });
    const obj = Object.create(getterSetters) as AtomContextValueType<T>;
    Object.keys(_contexts).forEach(key => {
      Object.defineProperty(obj, key, {
        get() {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          return React.useContext(_contexts[key]);
        },
      });
    });
    return Object.freeze(obj);
  }, []);
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
    // @ts-expect-error it is safe that context default value is null
    getters: null,
    // @ts-expect-error it is safe that context default value is null
    setters: null,
    // @ts-expect-error it is safe that context default value is null
    contextValue: null,
    getDefaultValue() {
      return initValue;
    },
    getContextValue() {
      return initValue;
    },
  });
  AtomicContext.displayName = 'AtomicContext';

  const AtomProvider = React.memo(function AtomProvider(
    props: React.PropsWithChildren<{
      keyName: keyof T;
      onChangeRef: React.RefObject<OnChange<T> | undefined>;
    }>
  ) {
    const key = props.keyName;
    const { contextValue, setters } = React.useContext(AtomicContext);
    const [val, setVal] = React.useState(contextValue.current![key]);
    const valRef = React.useRef(val);
    valRef.current = val;
    setters.current![key] = React.useCallback(value => {
      setVal(value);
      contextValue.current![key] = value;
      props.onChangeRef.current?.({ key, value, oldValue: valRef.current }, contextValue.current!);
    }, []);

    return React.createElement(contexts[key].Provider, { value: val }, props.children);
  });

  function Provider(
    props: React.ProviderProps<T> & {
      onChange?: OnChange<T>;
    }
  ) {
    const initValueRef = React.useRef(props.value);
    if (initValueRef.current !== props.value) {
      throw new Error('"value" passed to Provider can not be changed, please use useMemo.');
    }
    if (Object.prototype.toString.call(props.value) !== '[object Object]') {
      throw new Error('"value" prop is required for Provider component.');
    }
    const keys = Object.keys(props.value) as (keyof T)[];
    if (keys.length === 0) {
      throw new Error('"value" passed to Provider component can not be empty object.');
    }
    const invalidKey = keys.find(k => !(k in contexts));
    if (invalidKey) {
      throw new Error(
        `property "${String(
          invalidKey
        )}" does not exist in the initial value passed to createAtomicContext.`
      );
    }

    const currentValue = props.value;

    const valueRef = React.useRef<T>(currentValue);
    if (valueRef.current === currentValue) {
      valueRef.current = { ...currentValue };
    }

    const onChangeRef = React.useRef(props.onChange);
    onChangeRef.current = props.onChange;

    let provider = props.children;
    const gettersRef = React.useRef({} as GettersType<T>);

    for (const key of keys) {
      if (!(key in gettersRef.current)) {
        gettersRef.current[key] = () => {
          return valueRef.current[key];
        };
      }
      provider = React.createElement(
        AtomProvider,
        {
          keyName: key,
          onChangeRef,
        },
        provider
      );
    }

    const settersRef = React.useRef({} as SettersType<T>);

    const rootValue = React.useMemo<RootValue<T>>(() => {
      return {
        getters: gettersRef,
        setters: settersRef,
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
