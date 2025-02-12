import type {
  AtomicContextGettersType,
  AtomicContextMethodsType,
  AtomicContextSettersType,
  AtomicContextType,
  AtomicContextValueType,
  AtomicProviderType,
  ContextsType,
  ProviderOnChangeType,
  RootValue,
} from './types.ts'
/**
 * Optimized React context. Created by tingyuan.
 * Allows individual reading and writing of each property of the value
 * while preventing unnecessary full re-renders.
 */
import React from 'react'
import { name } from '../package.json'

const NotUnderProviderError = `${name}: components using useAtomicContext must be wrapped by the Provider.`

// https://github.com/Andarist/use-constant
function useConstant<T>(fn: () => T): T {
  const ref = React.useRef<{ v: T }>()

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
  initValue: T,
): AtomicContextType<T> {
  const contexts = Object.create(null) as ContextsType<T>
  if (Object.prototype.toString.call(initValue) !== '[object Object]') {
    throw new Error(
      `${name}: "initValue" passed to createAtomicContext is required and must be object.`,
    )
  }
  const allKeys = Object.keys(initValue) as (keyof T)[]
  for (const key of allKeys) {
    contexts[key] = React.createContext<any>(null)
    if (typeof key === 'string') {
      contexts[key].displayName = `${key}Context`
    }
  }

  const AtomicContext = React.createContext<RootValue<T>>({
    getterSetters: null,
    valueRef: null,
    onChangeRef: null,
  })
  AtomicContext.displayName = 'AtomicContext'

  const AtomProviderWrapper = React.memo(
    (props: React.PropsWithChildren<{ valueKey: keyof T }>) => {
      const key = props.valueKey
      const { valueRef, onChangeRef, getterSetters } = React.useContext(AtomicContext)
      if (!valueRef?.current || !getterSetters) {
        throw new Error(NotUnderProviderError)
      }
      const [val, setVal] = React.useState(() => valueRef.current[key])
      const valRef = React.useRef(val)
      valRef.current = val
      const k = key as string
      const setKey = `set${k[0].toUpperCase()}${k.slice(1)}` as const
      // @ts-expect-error good to runtime
      getterSetters[setKey] = React.useCallback((value: T[keyof T]) => {
        setVal((v) => {
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
          getterSetters,
        )
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])

      return React.createElement(contexts[key].Provider, { value: val }, props.children)
    },
  )

  const Provider = React.memo<AtomicProviderType<T>>((props) => {
    if (Object.prototype.toString.call(props.value) !== '[object Object]') {
      throw new Error(`${name}: "value" prop of <Provider> is required and must be object.`)
    }
    if ('onChange' in props && typeof props.onChange !== 'function') {
      throw new Error(`${name}: "onChange" prop of <Provider> must be a function.`)
    }
    const keysRef = React.useRef<(keyof T)[]>([])
    if (!keysRef.current.length) {
      keysRef.current = Object.keys(props.value)
    }
    const valueRef = React.useRef<T>(props.value)

    const onChangeRef = React.useRef(props.onChange)
    onChangeRef.current = props.onChange

    let provider = props.children

    for (const key of keysRef.current) {
      if (!(key in contexts)) {
        throw new Error(
          `${name}: property "${String(
            key,
          )}" does not exist in the initial value passed to createAtomicContext.`,
        )
      }
      provider = React.createElement(
        AtomProviderWrapper,
        {
          valueKey: key,
        },
        provider,
      )
    }
    const rootValue = useConstant<RootValue<T>>(() => {
      const getterSetters: AtomicContextMethodsType<T> = Object.create({
        get() {
          console.warn(
            `${name}: The "get()" method is only used for development to inspect the current context value.`,
          )
          return Object.freeze({ ...valueRef.current })
        },
      })
      for (const key of keysRef.current) {
        const k = key as string
        const getKey = `get${k[0].toUpperCase()}${k.slice(1)}`
        // @ts-expect-error good to runtime
        getterSetters[getKey] = () => valueRef.current[key]
      }

      return {
        getterSetters,
        valueRef,
        onChangeRef,
      } satisfies RootValue<T>
    })
    return React.createElement(AtomicContext.Provider, { value: rootValue }, provider)
  })

  return {
    Provider,
    _contexts: contexts,
    _atomicContext: AtomicContext,
    get displayName() {
      return AtomicContext.displayName
    },
    set displayName(n) {
      AtomicContext.displayName = n
    },
    // _currentValue: initValue,
    typeof: '$AtomicContext' as const,
  } satisfies AtomicContextType<T>
}

/**
 * react hook to read value from an atomic context.
 * @see https://github.com/lovetingyuan/react-atomic-context#readme
 * @param context atomic context created by `createAtomicContext`
 * @returns context value with getters and setters of each property.
 */
function useAtomicContext<T extends Record<string, unknown>>(context: AtomicContextType<T>) {
  const methods = useAtomicContextMethods(context)
  const { _contexts } = context
  return useConstant(() => {
    const obj = Object.create(methods) as AtomicContextValueType<T>
    Object.keys(_contexts).forEach((key) => {
      Object.defineProperty(obj, key, {
        get() {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          return React.useContext(_contexts[key])
        },
      })
    })
    return Object.freeze(obj)
  })
}

/**
 * react hook to read getters and setters methods of an atomic context.
 * @see https://github.com/lovetingyuan/react-atomic-context#readme
 * @param context atomic context created by `createAtomicContext`
 * @returns getters and setters methods of each property.
 */
function useAtomicContextMethods<T extends Record<string, unknown>>(context: AtomicContextType<T>) {
  const { getterSetters } = React.useContext(context._atomicContext)
  if (!getterSetters) {
    throw new Error(NotUnderProviderError)
  }
  return getterSetters
}

export { createAtomicContext, useAtomicContext, useAtomicContextMethods }

export type {
  AtomicContextGettersType,
  AtomicContextMethodsType,
  AtomicContextSettersType,
  ProviderOnChangeType,
}
