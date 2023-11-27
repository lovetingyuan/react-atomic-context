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

export type AtomicContextGettersType<T extends Record<string, unknown>> = {
  [k in keyof T as GetSetKey<k, 'get'>]: () => T[k]
}

export type AtomicContextSettersType<T extends Record<string, unknown>> = {
  [k in keyof T as GetSetKey<k, 'set'>]: (newValue: T[k]) => void
}

export type AtomContextValueType<T extends Record<string, unknown>> = Omit<
  T &
    AtomicContextSettersType<T> &
    AtomicContextGettersType<T> & {
      /** get current context value */
      get: () => Readonly<T>
    },
  ''
>

export type OnChangeType<T extends Record<string, unknown>> = (
  changeInfo: {
    [K in keyof T]: { key: K; value: T[K]; oldValue: T[K] }
  }[keyof T],
  currentValue: T
) => void

export type ContextsType<T extends Record<string, unknown>> = {
  [k in keyof T]: React.Context<T[k]>
}

export interface AtomicContextType<T extends Record<string, unknown>> {
  _contexts: ContextsType<T>
  displayName?: string
  _atomicContext: React.Context<RootValue<T>>
  _currentValue: T
  // Provider: React.Component;
  typeof: '$AtomicContext'
}

export type RootValue<T extends Record<string, unknown>> = {
  getters: React.MutableRefObject<GettersType<T>> | null
  setters: React.MutableRefObject<SettersType<T>> | null
  contextValue: React.MutableRefObject<T> | null
}
