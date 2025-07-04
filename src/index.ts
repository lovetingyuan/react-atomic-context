/**
 * Optimized React context. Created by tingyuan.
 * Allows individual reading and writing of each property of the value
 * while preventing unnecessary full re-renders.
 */
import type {
  AtomicContextMethodsType,
  AtomicContextType,
  AtomicContextValueType,
  ContextOnChangeType,
  ContextsType,
  RootValue,
} from './types.ts'
import React from 'react'
import { name } from '../package.json'

const useContext = React.use || React.useContext
const NotUnderProviderError = `${name}: components using useAtomicContext must be wrapped by the Provider.`

// https://github.com/Andarist/use-constant
function useConstant<T>(fn: () => T): T {
  const ref = React.useRef<{ v: T }>(null)
  if (!ref.current) {
    ref.current = { v: fn() }
  }
  return ref.current.v
}

/**
 * create a new atomic context.
 * @see https://github.com/lovetingyuan/react-atomic-context#readme
 * @param initValue initial value for creating a new atomic context, required.
 * @returns a new atomic context
 */
function createAtomicContext<T extends Record<string, unknown>>(
  initValue: T
): AtomicContextType<T> {
  const contexts = Object.create(null) as ContextsType<T>
  if (Object.prototype.toString.call(initValue) !== '[object Object]') {
    throw new Error(
      `${name}: "initValue" passed to createAtomicContext is required and must be object.`
    )
  }
  const allKeys = Object.keys(initValue) as (keyof T)[]
  for (const key of allKeys) {
    contexts[key] = React.createContext<any>(null)
    if (typeof key === 'string') {
      contexts[key].displayName = `${key}Context`
    }
  }

  const RootContext = React.createContext<RootValue<T>>({
    valueRef: null,
    onChangeRef: null,
    contextValue: null,
  })
  RootContext.displayName = 'RootContext'

  const AtomProviderWrapper = React.memo(
    (props: React.PropsWithChildren<{ valueKey: keyof T }>) => {
      const key = props.valueKey
      const { valueRef, onChangeRef, contextValue } = useContext(RootContext)
      if (!valueRef?.current) {
        throw new Error(NotUnderProviderError)
      }
      const [val, setVal] = React.useState(() => valueRef.current[key])
      const valRef = React.useRef(val)
      valRef.current = val
      const k = key as string
      const setKey = `set${k[0].toUpperCase()}${k.slice(1)}` as const

      const methods = Object.getPrototypeOf(contextValue) as AtomicContextMethodsType<T>
      if (!(setKey in methods)) {
        // @ts-expect-error good to runtime
        methods[setKey] = (value: T[keyof T]) => {
          setVal(v => {
            if (typeof value === 'function') {
              const result = value(v)
              valueRef.current[key] = result
              return result
            }
            valueRef.current[key] = value
            return value
          })
          onChangeRef?.current?.(
            { key, value: valueRef.current[key], oldValue: valRef.current },
            methods
          )
        }
      }

      return React.createElement(contexts[key].Provider, { value: val }, props.children)
    }
  )
  AtomProviderWrapper.displayName = 'AtomicProviderInner'

  function Provider(
    props: React.ProviderProps<T> & {
      onChange?: ContextOnChangeType<T>
    }
  ): React.ReactElement<React.ProviderProps<RootValue<T>>> {
    if (Object.prototype.toString.call(props.value) !== '[object Object]') {
      throw new Error(`${name}: "value" prop of <Provider> is required and must be object.`)
    }
    if ('onChange' in props && typeof props.onChange !== 'function') {
      throw new Error(`${name}: "onChange" prop of <Provider> must be a function.`)
    }
    const valueRef = React.useRef<T>(props.value)
    const onChangeRef = React.useRef(props.onChange)
    onChangeRef.current = props.onChange
    let provider = props.children
    const keys = Object.keys(props.value) as (keyof T)[]
    for (const key of keys) {
      if (!(key in contexts)) {
        throw new Error(
          `${name}: property "${String(
            key
          )}" does not exist in the initial value passed to createAtomicContext.`
        )
      }
      provider = React.createElement(
        AtomProviderWrapper,
        {
          valueKey: key,
        },
        provider
      )
    }
    const rootValue = useConstant<RootValue<T>>(() => {
      const methods: AtomicContextMethodsType<T> = Object.create({
        get() {
          console.warn(
            `${name}: The "get()" method is only used for development to inspect the current context value.`
          )
          return Object.freeze({ ...valueRef.current })
        },
      })
      const contextValue = Object.create(methods) as AtomicContextValueType<T>
      for (const key of keys) {
        const k = key as string
        const getKey = `get${k[0].toUpperCase()}${k.slice(1)}`
        // @ts-expect-error good to runtime
        methods[getKey] = () => valueRef.current[key]
        Object.defineProperty(contextValue, key, {
          get() {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            return useContext(contexts[key])
          },
        })
      }

      return {
        valueRef,
        onChangeRef,
        contextValue,
      } satisfies RootValue<T>
    })
    return React.createElement(RootContext.Provider, { value: rootValue }, provider)
  }

  Object.assign(Provider, {
    Provider,
    typeof: '$AtomicContext' as const,
    _contexts: contexts,
    _RootContext: RootContext,
    get displayName() {
      return RootContext.displayName
    },
    set displayName(n) {
      RootContext.displayName = n
    },
  })
  return Provider as unknown as AtomicContextType<T>
}

/**
 * react hook to read value from an atomic context.
 * @see https://github.com/lovetingyuan/react-atomic-context#readme
 * @param context atomic context created by `createAtomicContext`
 * @returns context value with getters and setters of each property.
 */
function useAtomicContext<T extends Record<string, unknown>>(context: AtomicContextType<T>) {
  const { contextValue } = useContext(context._RootContext)
  if (!contextValue) {
    throw new Error(NotUnderProviderError)
  }
  return contextValue
}

export { createAtomicContext, useAtomicContext }
export type { AtomicContextMethodsType, ContextOnChangeType }
