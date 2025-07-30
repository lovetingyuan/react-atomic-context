import type React from 'react'

export type GetSetKey<K, O extends 'get' | 'set'> = K extends `${infer L}${infer R}`
  ? `${O}${Uppercase<L>}${R}`
  : never
/**
 * type of getters object according the context value.
 */
export type AtomicContextGettersType<
  T extends Record<string, unknown>,
  K extends keyof T = keyof T,
> = {
  [k in K as GetSetKey<k, 'get'>]: () => T[k]
}

/**
 * type of setters object according the context value.
 */
export type AtomicContextSettersType<
  T extends Record<string, unknown>,
  K extends keyof T = keyof T,
> = {
  [k in K as GetSetKey<k, 'set'>]: (
    newValue: T[k] extends (...v: infer A) => infer R
      ? (o: (...v: A) => R) => (...v: A) => R
      : T[k] | ((v: T[k]) => T[k])
  ) => void
}

export type AtomicContextMethodsType<
  T extends Record<string, unknown>,
  K extends keyof T = keyof T,
> = Omit<
  AtomicContextSettersType<T, K> &
    AtomicContextGettersType<T, K> & {
      /** get current context value */
      get: () => Readonly<T>
    },
  ''
>

/**
 * type of atomic context value(return type of `useAtomicContext`)
 */
export type AtomicContextValueType<T extends Record<string, unknown>> = Omit<
  T & AtomicContextMethodsType<T>,
  ''
>

/**
 * type of onChange callback which is passed to Context.
 */
export type ContextOnChangeType<T extends Record<string, unknown>> = (
  changeInfo: {
    [K in keyof T]: { key: K; value: T[K]; oldValue: T[K]; trace?: unknown }
  }[keyof T],
  methods: AtomicContextMethodsType<T>
) => void

export type ContextsType<T extends Record<string, unknown>> = {
  [k in keyof T]: React.Context<T[k]>
}

export interface RootValueType<T extends Record<string, unknown>> {
  valueRef: React.RefObject<T> | null
  onChangeRef: React.RefObject<ContextOnChangeType<T> | undefined> | null
  contextValue: AtomicContextValueType<T> | null
}

/**
 * type of atomic context(return type of `createAtomicContext`)
 */
export interface AtomicContextType<T extends Record<string, unknown>> {
  (
    props: React.ProviderProps<T> & {
      onChange?: ContextOnChangeType<T>
    }
  ): React.ReactElement<React.ProviderProps<RootValueType<T>>>
  _contexts: ContextsType<T>
  displayName?: string
  _RootContext: React.Context<RootValueType<T>>
  Provider: (
    props: React.ProviderProps<T> & {
      onChange?: ContextOnChangeType<T>
    }
  ) => React.ReactElement<React.ProviderProps<RootValueType<T>>>
  typeof: '$AtomicContext'
}

/**
 * get default value type by inferring atomic context type.
 * In general, it is sufficient to directly export the type of the initial value
 * and there is no need to use this type.
 */
export type GetAtomicContextValueType<C extends AtomicContextType<any>> =
  C extends AtomicContextType<infer U> ? U : never
