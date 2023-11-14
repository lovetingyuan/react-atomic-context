/**
 * 优化过的context，可以单独读写每个属性而不会引起全量的重渲染
 * (没有适配devtool，会报错)
 */
import React from 'react';
import usePrevious from '../usePrevious';

interface AtomicContextType {
  contexts: {
    [k: string]: React.Context<{ atom: StateFunc<any> }>;
  };
  RootContext: React.Context<RootValue<any>>;
  initValue: any;
  // Provider: React.Component;
  typeof: '$AtomicContext';
}

export function useAtomicContext<T extends AtomicContextType>({ contexts }: T) {
  return React.useMemo(() => {
    const obj = {} as {
      [k in keyof T['contexts']]: React.ContextType<T['contexts'][k]>['atom'];
    };
    Object.keys(contexts).forEach((key) => {
      Object.defineProperty(obj, key, {
        get() {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          return React.useContext(contexts[key as string]).atom;
        },
      });
    });
    return obj;
  }, [contexts]);
}

// 用来获取当前context的值，仅用于开发调试
export function useInspectAtomicContext<T extends AtomicContextType>({ RootContext }: T) {
  const { getContextValue } = React.useContext(RootContext);
  return getContextValue as () => T['initValue'];
}

type StateFunc<T> = {
  (): T;
  (v: T | undefined): void;
};

type RootValue<T> = {
  getContextValue: () => T;
};

export function createAtomicContext<T extends Record<string, unknown>>(initValue: T) {
  Object.seal(initValue);
  const ctxs = {} as {
    [k in keyof T]: React.Context<{ atom: StateFunc<T[k]> }>;
  };
  for (const key in initValue) {
    ctxs[key] = React.createContext<any>(null);
  }
  const RootContext = React.createContext<RootValue<T>>({
    getContextValue() {
      return initValue;
    },
  });
  const Provider = React.memo(
    (
      props: React.ProviderProps<Partial<T>> & {
        listeners?: {
          [K in keyof T]?: (v: T[K]) => void;
        };
      },
    ) => {
      if (
        Object.prototype.toString.call(props.value) !== '[object Object]' ||
        Object.keys(props.value).length === 0
      ) {
        throw new Error(
          '"value" prop is required for Provider component and must be none empty object.',
        );
      }
      for (const key in props.value) {
        if (!(key in ctxs)) {
          throw new Error(
            `property "${key}" does not exist in the initial value passed to createAtomicContext.`,
          );
        }
      }
      const atoms = React.useRef(
        {} as {
          [k in keyof T]: StateFunc<T[k]>;
        },
      );
      // keys需要保持第一次的顺序，因为用了hook
      const keys = React.useRef<(keyof T)[]>(Object.keys(props.value));
      const previousValue = usePrevious(props.value);
      const currentValue = {
        ...previousValue,
        ...props.value,
      } as T;
      const valueRef = React.useRef(currentValue);
      React.useEffect(() => {
        for (const key in props.value) {
          const val = atoms.current[key]();
          if (val !== props.value[key]) {
            atoms.current[key](props.value[key]);
          }
        }
      }, [props.value]);
      const rootValue = React.useMemo<RootValue<T>>(() => {
        return {
          getContextValue() {
            return valueRef.current;
          },
        };
      }, []);
      let provider = props.children;
      for (const key of keys.current) {
        // 需要保持顺序
        // eslint-disable-next-line react-hooks/rules-of-hooks
        atoms.current[key] = useGetSetState<T[keyof T]>(currentValue[key], (v) => {
          valueRef.current[key] = v;
          props.listeners?.[key]?.(v);
        });
        const atom = atoms.current[key];
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const val = React.useMemo(() => ({ atom }), [atom()]); // atom保证不变化（声明依赖时要先计算然后声明计算后的值）
        provider = React.createElement(ctxs[key].Provider, { value: val }, provider);
      }
      return React.createElement(RootContext.Provider, { value: rootValue }, provider);
    },
  );
  return {
    contexts: ctxs,
    Provider,
    RootContext,
    initValue,
    typeof: '$AtomicContext' as const,
  };
}

function useGetSetState<T>(data: T, onChange?: (v: T) => void) {
  const [val, setVal] = React.useState(data);
  const currentValRef = React.useRef(val);
  currentValRef.current = val;
  const changeRef = React.useRef<((v: T) => void) | undefined>(onChange);
  changeRef.current = onChange;
  return React.useCallback((...args: [T] | []) => {
    if (args.length) {
      setVal(args[0]);
      if (changeRef.current) {
        changeRef.current(args[0]);
      }
    } else {
      return currentValRef.current;
    }
  }, []) as StateFunc<T>;
}
