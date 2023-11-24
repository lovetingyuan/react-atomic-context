export type StateFunc<T> = {
  (): T;
  (v: T | undefined): void;
};

export type RootValue<T extends Record<string, unknown>> = {
  atoms: React.RefObject<AtomsType<T>>;
  contextValue: React.RefObject<T>;
  getDefaultValue: () => T;
  getContextValue: () => T;
};

export type OnChange<T extends Record<string, unknown>> = (
  p: {
    [K in keyof T]: { key: K; value: T[K]; oldValue: T[K] };
  }[keyof T],
  v: T,
) => void;

export type AtomsType<T extends Record<string, unknown>> = {
  [k in keyof T]: StateFunc<T[k]>;
};

export type ContextsType<T extends Record<string, unknown>> = {
  [k in keyof T]: React.Context<{ atom: StateFunc<T[k]> }>;
};

export interface AtomicContextType<T extends Record<string, unknown>> {
  _contexts: ContextsType<T>;
  displayName?: string;
  _atomicContext: React.Context<RootValue<T>>;
  _currentValue: T;
  // Provider: React.Component;
  typeof: '$AtomicContext';
}
