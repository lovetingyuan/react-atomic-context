export type StateFunc<T> = {
  (): T;
  (v: T | undefined): void;
};

export type RootValue<T extends Record<string, unknown>> = {
  bootstrap: boolean;
  atoms: React.MutableRefObject<AtomsType<T>> | null;
  getContextValue: () => T;
};

export type OnChangeParam<T extends Record<string, unknown>> = {
  [K in keyof T]: { key: K; value: T[K]; oldValue: T[K] };
}[keyof T];

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
