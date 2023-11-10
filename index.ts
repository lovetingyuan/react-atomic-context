import React from 'react';

export function useAtomicContext<
  T extends {
    contexts: {
      [k: string]: React.Context<{ atom: StateFunc<any> }>;
    };
    // Provider: any
    type: 'MyContext';
  },
>({ contexts }: T) {
  return React.useMemo(() => {
    const value = {} as {
      [k in keyof T['contexts']]: React.ContextType<T['contexts'][k]>['atom'];
    };
    Object.keys(contexts).forEach((key) => {
      Object.defineProperty(value, key, {
        get() {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          return React.useContext(contexts[key as string]).atom;
        },
      });
    });
    return value;
  }, [contexts]);
}

type StateFunc<T> = {
  (): T;
  (v: T | undefined): void;
};

export function createAtomicContext<T extends Record<string, unknown>>(initValue: T) {
  Object.seal(initValue);
  const ctxs = {} as {
    [k in keyof T]: React.Context<{ atom: StateFunc<T[k]> }>;
  };
  for (const key in initValue) {
    ctxs[key] = React.createContext<any>(null);
  }
  const Provider = (props: React.ProviderProps<Partial<T>>) => {
    const atoms = React.useRef(
      {} as {
        [k in keyof T]: StateFunc<T[k]>;
      },
    );
    // need to keep order
    const keys = React.useRef<(keyof T)[]>(Object.keys(props.value));
    const previousValue = usePrevious(props.value);
    if (
      Object.prototype.toString.call(props.value) !== '[object Object]' ||
      Object.keys(props.value).length === 0
    ) {
      throw new Error(
        '"value" prop is required for Provider component and must be a no empty object.',
      );
    }
    for (const key in props.value) {
      if (!(key in ctxs)) {
        throw new Error(
          `property "${key}" does not exist in the initial value passed to createAtomicContext.`,
        );
      }
    }
    const currentValue = {
      ...previousValue,
      ...props.value,
    };
    React.useEffect(() => {
      for (const key in props.value) {
        const val = atoms.current[key]();
        if (val !== props.value[key]) {
          atoms.current[key](props.value[key]);
        }
      }
    }, [props.value]);
    let provider = props.children;
    for (const key of keys.current) {
      // need to keep order
      // eslint-disable-next-line react-hooks/rules-of-hooks
      atoms.current[key] = useGetState<T[keyof T]>(currentValue[key]);
      const atom = atoms.current[key];
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const val = React.useMemo(() => ({ atom }), [atom()]); // atom is stable
      provider = React.createElement(ctxs[key].Provider, { value: val }, provider);
    }
    return provider;
  };
  return {
    contexts: ctxs,
    Provider,
    type: 'MyContext' as const,
  };
}

function useGetState<T>(data?: T) {
  const [val, setVal] = React.useState(data);
  const currentValRef = React.useRef(val);
  currentValRef.current = val;
  return React.useCallback((...args: [T] | []) => {
    if (args.length) {
      setVal(args[0]);
    } else {
      return currentValRef.current;
    }
  }, []) as StateFunc<T>;
}

function usePrevious<T>(value: T) {
  const ref = React.useRef<T | undefined>();
  React.useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}
