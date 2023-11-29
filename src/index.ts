/**
 * 优化过的context，可以单独读写value的每个属性而不会引起全量的重渲染
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
  OnChangeType,
  ProviderType,
} from './types.ts'

export function useAtomicContext<T extends Record<string, unknown>>({
  _contexts,
  _atomicContext,
}: AtomicContextType<T>) {
  const { getters, setters, contextValue } = React.useContext(_atomicContext)
  if (!setters || !getters || !contextValue) {
    throw new Error('components using atomic-context must be wrapped by the Provider.')
  }
  return React.useMemo(() => {
    const getterSetters: Record<string, unknown> = {
      get() {
        return Object.freeze({ ...contextValue.current })
      },
    }
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

// 创建一个context，必须传入初始值
export function createAtomicContext<T extends Record<string, unknown>>(
  initValue: T
): AtomicContextType<T> {
  Object.seal(initValue)
  const contexts = Object.create(null) as ContextsType<T>
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
      onChangeRef: React.RefObject<OnChangeType<T> | undefined>
    }>
  ) {
    const key = props.keyName
    const { contextValue, setters } = React.useContext(AtomicContext)
    if (!contextValue || !setters) {
      throw new Error('components using atomic-context must be wrapped by the Provider.')
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

  const Provider: ProviderType<T> = props => {
    const initValueRef = React.useRef(props.value)
    if (initValueRef.current !== props.value) {
      throw new Error('"value" passed to Provider can not be changed, please use useMemo.')
    }
    if (Object.prototype.toString.call(props.value) !== '[object Object]') {
      throw new Error('"value" prop is required for Provider component.')
    }
    const keys = Object.keys(props.value) as (keyof T)[]
    if (keys.length === 0) {
      throw new Error('"value" passed to Provider component can not be empty object.')
    }
    for (const key of keys) {
      if (!key) {
        throw new Error(
          'key of the initial value which passed to createAtomicContext can not be empty.'
        )
      }
      if (!(key in contexts)) {
        throw new Error(
          `property "${String(
            key
          )}" does not exist in the initial value passed to createAtomicContext.`
        )
      }
    }

    const valueRef = React.useRef<T>(props.value)
    if (valueRef.current === props.value) {
      valueRef.current = Object.seal({ ...props.value })
    }

    const onChangeRef = React.useRef(props.onChange)
    onChangeRef.current = props.onChange

    let provider = props.children
    const gettersRef = React.useRef({} as GettersType<T>)

    for (const key of keys) {
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

export type { AtomContextValueType, AtomicContextGettersType, AtomicContextSettersType }
