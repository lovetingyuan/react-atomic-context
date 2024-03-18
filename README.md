# react-atomic-context [![npm version](https://img.shields.io/npm/v/react-atomic-context)](https://www.npmjs.com/package/react-atomic-context)

When we use React Context, we often face the problem that when the Provider's value changes (e.g., when a component below it modifies a property in the value), all components that use that context are re-rendered, even if they do not depend on the changed property value. This can lead to unnecessary re-renders and negatively impact the performance of our application.

For this issue, this library provides a simple solution.

You can use this library to individually read and write each property in React context without worrying about triggering a full re-render of all related components under the context.

## Install:

`npm i react-atomic-context`

`yarn add react-atomic-context`

`pnpm install react-atomic-context`

Only `3kB` size.

## Example:

```tsx
import React from 'react'
import { createAtomicContext, useAtomicContext } from 'react-atomic-context'

const AppContext = createAtomicContext({
  foo: 'foo',
  bar: 'bar',
})

const Foo = React.memo(function Foo() {
  const { foo, setFoo, setBar } = useAtomicContext(AppContext)
  console.log('foo rendered')
  return (
    <div>
      <p> this is foo: {foo} </p>
      <button
        onClick={() => {
          setFoo(`foo${Math.random().toString().slice(0, 5)}`)
        }}
      >
        change foo
      </button>
      <button
        onClick={() => {
          setBar(`bar${Math.random().toString().slice(0, 5)}`)
        }}
      >
        change bar
      </button>
      <hr />
      <Bar />
    </div>
  )
})

const Bar = React.memo(function Bar() {
  const { bar, setBar } = useAtomicContext(AppContext)
  console.log('bar rendered')
  return (
    <div>
      <p> this is bar: {bar} </p>
      <button
        onClick={() => {
          setBar(`bar${Math.random().toString().slice(0, 5)}`)
        }}
      >
        change bar
      </button>
    </div>
  )
})

export default function App() {
  const initState = React.useMemo(() => {
    return {
      foo: 'foo',
      bar: 'bar',
    }
  }, [])
  return (
    <AppContext.Provider
      value={initState}
      onChange={({ key, value, oldValue }) => {
        console.log(`${key} changed from ${oldValue} to ${value}`)
      }}
    >
      <Foo />
    </AppContext.Provider>
  )
}
```

[![Open in CodeSandbox](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/p/sandbox/react-atomic-context-4mkp5t?file=%2Fsrc%2FApp.js%3A71%2C1)

Overall, the usage of `react-atomic-context` is similar to regular React context. First, you create a context. Then, you use its Provider to wrap the components you want to render. Within the component, you can read and modify the context value using the provided use hook.

## API:

- createAtomicContext

  - This method is used to create a context, similar to `React.createContext`, but it requires an object as the initial value.
    eg:

    ```js
    import { createAtomicContext } from 'react-atomic-context'
    // The initial value is required and can only be one object
    const AppContext = createAtomicContext({
      foo: 'foo',
      bar: 'bar',
    })
    export { AppContext }
    ```

  - The created context provides a `Provider` component, which wraps the components to be rendered. It must be provided with a prop named `value`, whose value is typically similar to the initial value and contains properties consistent with the initial value(can not contain any extra properties).
    Changing value of `value` prop won't take effect.
    eg:

    ```js
    const App = () => {
      // Right way
      const initValue = React.useMemo(() => {
        return {
          foo: 'foooo',
          bar: 'barrr',
        }
      }, [])
      // Wrong! "initValue" can not change, the provider does not care about the overall change of the initial value
      const initValue = {
        foo: 'foooo',
        bar: 'barrr',
      }
      // Wrong! Because "baz" is not in AppContext initial value.
      const initValue = React.useMemo(() => {
        return {
          foo: 'foooo',
          bar: 'barrr',
          baz: 'bazzz', // baz is invalid here.
        }
      }, [])
      return (
        <AppContext.Provider value={initValue}>
          <YourComponent />
        </AppContext.Provider>
      )
    }
    ```

  - The Provider component also provides an additional `onChange` prop that accepts a function, which is called whenever any property changes.
    eg:

    ```js
    const App = () => {
      const initValue = React.useMemo(() => {
        return {
          foo: 'foooo',
          bar: 'barrr',
        }
      }, [])
      const handleChange = React.useCallback(({ key, value, oldValue }, methods) => {
        console.log(`${key} changed from ${oldValue} to ${value}`)
        console.log('getters and setters', methods)
      }, [])
      return (
        <AppContext.Provider value={initValue} onChange={handleChange}>
          <YourComponent />
        </AppContext.Provider>
      )
    }
    ```

  - There is no "Consumer" component available. The lib only supports accessing the context through calling `useAtomicContext`.

- useAtomicContext

  - This method is used to retrieve the current value from the context (provided by the nearest Provider's `value` prop).
    The value must be **accessed using deconstructed syntax**, for example: `const { foo } = useAtomicContext(context)`.
    eg:

    ```js
    import { useAtomicContext } from 'react-atomic-context'

    const MyComponent = () => {
      // Right way
      const { foo, bar } = useAtomicContext(AppContext)
      if (foo) {
        return <div>{foo}</div>
      }
      return <div>{bar}</div>
      // Wrong!
      const value = useAtomicContext(AppContext)
      if (value.foo) {
        return <div>{value.foo}</div>
      }
      return <div>{value.bar}</div>
    }
    ```

  - For each property, there are two additional methods provided. Such as, for the property `foo`, both `getFoo` and `setFoo` methods are provided. The `setFoo` method is the **only way** to update the value of the `foo` property, while `getFoo` is used solely to obtain the latest value of the `foo` property(in most case, just use `foo` instead of calling `getFoo`).
    eg:

    ```js
    const MyComponent = () => {
      const { foo, setFoo, getFoo } = useAtomicContext(AppContext)
      return (
        <div
          onClick={() => {
            setFoo(newValue)
          }}
        >
          {foo}
        </div>
      )
    }
    ```

  - Accessor methods(getters and setters) are reference-stable and will not change, so you can confidently ignore them in dependency arrays.
    eg:

    ```js
    const MyComponent = () => {
      const { bar, setFoo, getFoo } = useAtomicContext(AppContext)
      React.useEffect(() => {
        if (getFoo() !== bar) {
          setFoo(bar)
        }
      }, [bar]) // It is safe to omit getFoo and setFoo here.
      return <div>...</div>
    }
    ```

  - Specifically, this hook will return a method named `get` that returns the whole current value of the context (the returned value is read-only, like snapshot of state, for **debugging purposes only**).
    eg:

    ```js
    const MyComponent = () => {
      const { get } = useAtomicContext(AppContext)

      return (
        <div
          onClick={() => {
            console.log('current value of context is', get())
          }}
        >
          inspect current value
        </div>
      )
    }
    ```

## TypeScript support

```typescript
import type {
  AtomContextValueType,
  AtomicContextGettersType,
  AtomicContextSettersType,
  ProviderOnChangeType,
} from 'react-atomic-context'

const initValue = {
  foo: 'foo',
  bar: 123,
  baz: false,
}

const context = createAtomicContext(initValue)

/**
 * Getters = {
 *  getFoo: () => string
 *  getBar: () => number
 *  getBaz: () => boolean
 * }
 */
type Getters = AtomicContextGettersType<typeof initValue>

/**
 * Setters = {
 *  setFoo: (newValue: string) => void
 *  setBar: (newValue: number) => void
 *  setBaz: (newValue: boolean) => void
 * }
 */
type Setters = AtomicContextSettersType<typeof initValue>

/**
 * Setters = {
 *  setFoo: (newValue: string) => void
 *  setBaz: (newValue: boolean) => void
 * }
 */
type Setters = AtomicContextSettersType<typeof initValue, 'foo' | 'baz'>

/**
 * type of "onChange" callback type passed to Provider.
 *
 * OnChange = (
 *  changeInfo:
 *   | { key: 'foo', value: string, oldValue: string }
 *   | { key: 'bar', value: number, oldValue: number }
 *   | { key: 'baz', value: boolean, oldValue: boolean }
 *  methods: {
 *    getFoo: () => string,
 *    setFoo: (v: string) => void,
 *    getBar: () => number,
 *    setBar: (v: number) => void,
 *    getBaz: () => boolean,
 *    setBaz: (v: boolean) => void,
 *    get: () => { foo: string; bar: number; baz: boolean }
 *  }
 * ) => void
 */
type OnChange = ProviderOnChangeType<typeof initValue>
```

## Q&A

1. Why provide `getFoo` when we can directly access the value of `foo`?

   In most cases, there is no need to use `getFoo`. Accessing `foo` directly through destructuring informs React that the current component's rendering depends on the value of `foo`. Thus, when `foo` changes, the current component will be re-rendered. However, there are situations where we only want to retrieve the value of `foo` without caring about its changes. In such cases, you should use the `getFoo` method.

2. Why do I have to keep the Provider's `value` prop reference-stable?

   To ensure that the context of data changes has a stable single way, that is, by calling the setter method corresponding to the property.
   This also explains why the value passed to the provider cannot contain additional properties relative to the initial value when creating the context.

3. Why must context data be accessed in a deconstructed manner?

   Virtually every access to a context property is preceded by a call to `useContext`, so the property access order must be kept steady and comply with react hook requirements.
   And it's always a good programming practice to declare the properties and methods to be accessed in a deconstructed way at the beginning, which is clearer and easier to maintain your component.

4. Why my component still get rerendered?

   Important point but easy to ignore is that **do not forget to use `React.memo` to wrap your component**.
   By the way, There are a fews reasons leading to react component rerender. Such as calling setState, using normal react context, changing the key of the component, etc.

Thank you very much and hope to raise any questions.
