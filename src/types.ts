import React from 'react'

type GetSetKey<K, O extends 'get' | 'set'> = K extends `${infer L}${infer R}`
  ? `${O}${Uppercase<L>}${R}`
  : never

export type GettersType<T extends Record<string, unknown>> = {
  [k in keyof T]: () => T[k]
}

export type SettersType<T extends Record<string, unknown>> = {
  [k in keyof T]: (v: T[k]) => void
}

/**
 * type of getters object according the context value.
 */
export type AtomicContextGettersType<
  T extends Record<string, unknown>,
  K extends keyof T = keyof T
> = {
  [k in K as GetSetKey<k, 'get'>]: () => T[k]
}

/**
 * type of setters object according the context value.
 */
export type AtomicContextSettersType<
  T extends Record<string, unknown>,
  K extends keyof T = keyof T
> = {
  [k in K as GetSetKey<k, 'set'>]: (newValue: T[k]) => void
}

/**
 * type of atomic context value(return type of `useAtomicContext`)
 */
export type AtomContextValueType<T extends Record<string, unknown>> = Omit<
  T &
    AtomicContextSettersType<T> &
    AtomicContextGettersType<T> & {
      /** get current context value */
      get: () => Readonly<T>
    },
  ''
>

/**
 * type of onChange callback which is passed to Provider.
 */
export type ProviderOnChangeType<T extends Record<string, unknown>> = (
  changeInfo: {
    [K in keyof T]: { key: K; value: T[K]; oldValue: T[K] }
  }[keyof T],
  currentValue: T
) => void

export type ContextsType<T extends Record<string, unknown>> = {
  [k in keyof T]: React.Context<T[k]>
}

export type RootValue<T extends Record<string, unknown>> = {
  getters: React.MutableRefObject<GettersType<T>> | null
  setters: React.MutableRefObject<SettersType<T>> | null
  contextValue: React.MutableRefObject<T> | null
}

/**
 * atomic context Provider component type.
 */
export type AtomicProviderType<T extends Record<string, unknown>> = (
  props: React.ProviderProps<T> & {
    onChange?: ProviderOnChangeType<T>
  }
) => React.FunctionComponentElement<React.ProviderProps<RootValue<T>>>

/**
 * type of atomic context(return type of `createAtomicContext`)
 */
export interface AtomicContextType<T extends Record<string, unknown>> {
  _contexts: ContextsType<T>
  displayName?: string
  _atomicContext: React.Context<RootValue<T>>
  _currentValue: T
  Provider: AtomicProviderType<T>
  typeof: '$AtomicContext'
}

/**
 * get default value type by inferring atomic context type.
 * In general, it is sufficient to directly export the type of the initial value
 * and there is no need to use this type.
 */
export type GetAtomicContextValueType<C extends AtomicContextType<any>> =
  C extends AtomicContextType<infer U> ? U : never
