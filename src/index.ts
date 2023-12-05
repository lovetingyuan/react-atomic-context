/**
 * Optimized react context. Created by tingyuan.
 * Allows individual reading and writing of each property of the value
 * and meantime won't trigger a full re-rendering.
 */
import React from 'react'
import type {
  AtomContextValueType,
  AtomicContextType,
  ContextsType,
  GettersType,
  RootValue,
  SettersType,
  AtomicContextGettersType,
  AtomicContextSettersType,
  ProviderOnChangeType,
  AtomicProviderType,
  AtomContextMethodsType,
} from './types.ts'

const notUnderProviderError = 'components using useAtomicContext must be wrapped by the Provider.'

/**
 * create a new atomic context.
 * see: https://github.com/lovetingyuan/react-atomic-context#readme
 * @param initValue initial value for creating a new atomic context, required.
 * @returns a new atomic context
 */
export function createAtomicContext<T extends Record<string, unknown>>(
  initValue: T
): AtomicContextType<T> {
  Object.seal(initValue)
  const contexts = Object.create(null) as ContextsType<T>
  if (Object.prototype.toString.call(initValue) !== '[object Object]') {
    throw new Error('"initValue" passed to createAtomicContext is required and must be object.')
  }
  const allKeys = Object.keys(initValue) as (keyof T)[]
  for (const key of allKeys) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    contexts[key] = React.createContext<any>(null)
    if (typeof key === 'string') {
      contexts[key].displayName = key + 'Context'
    }
  }
  Object.freeze(contexts)

  const AtomicContext = React.createContext<RootValue<T>>({
    getters: null,
    setters: null,
    contextValue: null,
  })
  AtomicContext.displayName = 'AtomicContext'

  const AtomProvider = React.memo(function AtomProvider(
    props: React.PropsWithChildren<{
      keyName: keyof T
      onChangeRef: React.RefObject<ProviderOnChangeType<T> | undefined>
    }>
  ) {
    const key = props.keyName
    const { contextValue, setters } = React.useContext(AtomicContext)
    if (!contextValue || !setters) {
      throw new Error(notUnderProviderError)
    }
    const [val, setVal] = React.useState(contextValue.current[key])
    const valRef = React.useRef(val)
    valRef.current = val
    setters.current[key] = React.useCallback(value => {
      setVal(value)
      contextValue.current[key] = value
      props.onChangeRef.current?.({ key, value, oldValue: valRef.current }, contextValue.current)
    }, [])

    return React.createElement(contexts[key].Provider, { value: val }, props.children)
  })

  const Provider: AtomicProviderType<T> = props => {
    const initValueRef = React.useRef(props.value)
    if (initValueRef.current !== props.value) {
      console.warn('"value" passed to Provider can not be changed, please use useMemo.')
    }
    if (Object.prototype.toString.call(props.value) !== '[object Object]') {
      throw new Error('"value" prop of Provider is required and must be object.')
    }
    if (props.onChange && typeof props.onChange !== 'function') {
      throw new Error('"onChange" prop of Provider must be a function.')
    }
    const keys = Object.keys(initValueRef.current) as (keyof T)[]
    const valueRef = React.useRef<T>(initValueRef.current)
    if (valueRef.current === initValueRef.current) {
      valueRef.current = Object.seal({ ...initValueRef.current })
    }

    const onChangeRef = React.useRef(props.onChange)
    onChangeRef.current = props.onChange

    let provider = props.children
    const gettersRef = React.useRef({} as GettersType<T>)

    for (const key of keys) {
      if (!(key in contexts)) {
        throw new Error(
          `property "${String(
            key
          )}" does not exist in the initial value passed to createAtomicContext.`
        )
      }
      if (!(key in gettersRef.current)) {
        gettersRef.current[key] = () => {
          return valueRef.current[key]
        }
      }
      provider = React.createElement(
        AtomProvider,
        {
          keyName: key,
          onChangeRef,
        },
        provider
      )
    }

    const settersRef = React.useRef({} as SettersType<T>)

    const rootValue = React.useMemo<RootValue<T>>(() => {
      return {
        getters: gettersRef,
        setters: settersRef,
        contextValue: valueRef,
      } satisfies RootValue<T>
    }, [])
    return React.createElement(AtomicContext.Provider, { value: rootValue }, provider)
  }

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
    _currentValue: initValue,
    typeof: '$AtomicContext' as const,
  } satisfies AtomicContextType<T>
}

/**
 * react hook to read value from an atomic context.
 * see: https://github.com/lovetingyuan/react-atomic-context#readme
 * @param param atomic context created by `createAtomicContext`
 * @returns context value with getters and setters of each property.
 */
export function useAtomicContext<T extends Record<string, unknown>>({
  _contexts,
  _atomicContext,
}: AtomicContextType<T>) {
  const { getters, setters, contextValue } = React.useContext(_atomicContext)
  if (!setters || !getters || !contextValue) {
    throw new Error(notUnderProviderError)
  }
  return React.useMemo(() => {
    const getterSetters: Record<string, unknown> = Object.create({
      get() {
        console.warn(
          'The "get" method is only used for development purposes to view the current value of the context.'
        )
        return Object.freeze({ ...contextValue.current })
      },
    })
    const _getters = getters.current
    const _setters = setters.current
    Object.keys(_getters).forEach(k => {
      getterSetters[`get${k[0].toUpperCase()}${k.slice(1)}`] = _getters[k]
    })
    Object.keys(_setters).forEach(k => {
      getterSetters[`set${k[0].toUpperCase()}${k.slice(1)}`] = _setters[k]
    })
    const obj = Object.create(Object.freeze(getterSetters)) as AtomContextValueType<T>
    Object.keys(_contexts).forEach(key => {
      Object.defineProperty(obj, key, {
        get() {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          return React.useContext(_contexts[key])
        },
      })
    })
    return Object.freeze(obj)
  }, [])
}

export function useAtomicContextMethods<T extends Record<string, unknown>>(
  context: AtomicContextType<T>
): AtomContextMethodsType<T> {
  return Object.getPrototypeOf(useAtomicContext(context))
}

export type {
  AtomContextValueType,
  AtomicContextGettersType,
  AtomicContextSettersType,
  ProviderOnChangeType,
}
