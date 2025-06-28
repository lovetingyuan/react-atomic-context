# react-atomic-context [![npm version](https://img.shields.io/npm/v/react-atomic-context)](https://www.npmjs.com/package/react-atomic-context)

When using `react context`, we typically face two main issues:

1. When the `value` passed to `Provider` changes, all components using the corresponding context will trigger re-renders. For many components, these re-renders are unnecessary.
2. There's no convenient way to update specific properties with fine granularity.

For these issues, this library provides a simple solution. It helps you read and write any property within the value from any child component under the context, and includes a mechanism similar to reactive tracking to avoid unnecessary re-renders.

## Installation:

`npm i react-atomic-context`

`yarn add react-atomic-context`

`pnpm install react-atomic-context`

Bundle size < `3kB`.

## Example:

```tsx
import React from 'react'
import { createAtomicContext, useAtomicContext } from 'react-atomic-context'

const AppContext = createAtomicContext({
  foo: 'foo',
  bar: 'bar',
})

const Foo = React.memo(() => {
  const { foo, setFoo, setBar } = useAtomicContext(AppContext)
  console.log('foo rendered')
  return (
    <div>
      <p>
        {' '}
        this is foo:
        {foo}
      </p>
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

const Bar = React.memo(() => {
  const { bar, setBar } = useAtomicContext(AppContext)
  console.log('bar rendered')
  return (
    <div>
      <p>
        {' '}
        this is bar:
        {bar}
      </p>
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
    <AppContext
      value={initState}
      onChange={({ key, value, oldValue }) => {
        console.log(`${key} changed from ${oldValue} to ${value}`)
      }}
    >
      <Foo />
    </AppContext>
  )
}
```

## 🌏  Open in the Cloud 
Click the button below to start a new development environment:

[![Open in VS Code](https://img.shields.io/badge/Open%20in-VS%20Code-blue?logo=visualstudiocode)](https://vscode.dev/github/lovetingyuan/react-atomic-context)
[![Open in Glitch](https://img.shields.io/badge/Open%20in-Glitch-blue?logo=glitch)](https://glitch.com/edit/#!/import/github/lovetingyuan/react-atomic-context)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/lovetingyuan/react-atomic-context)
[![Open in CodeSandbox](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/p/sandbox/react-atomic-context-4mkp5t?file=%2Fsrc%2FApp.js%3A71%2C1)
[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/lovetingyuan/react-atomic-context)
[![Open in Repl.it](https://replit.com/badge/github/withastro/astro)](https://replit.com/github/lovetingyuan/react-atomic-context)
[![Open in Codeanywhere](https://codeanywhere.com/img/open-in-codeanywhere-btn.svg)](https://app.codeanywhere.com/#https://github.com/lovetingyuan/react-atomic-context)
[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/lovetingyuan/react-atomic-context)

The example above demonstrates the usage of `react-atomic-context`. As you can see, the usage is very similar to native React Context. Please read the following sections for important considerations.

## API:

- createAtomicContext

  - This method creates an "atomic" context, similar to `React.createContext`, but with one difference: **you must pass an object value as the initial value**.
    Example:

    ```js
    import { createAtomicContext } from 'react-atomic-context'
    // The parameter for createAtomicContext must be an object and cannot be omitted
    const AppContext = createAtomicContext({
      foo: 'foo',
      bar: 'bar',
    })
    export { AppContext }
    ```

  - The created context provides a `Provider` component that accepts a `value` prop as the current context value. Note that: **The Provider component's `value` must maintain type consistency with the initial value provided when creating the context**, meaning the value object cannot have any additional properties. Additionally, keep in mind that the `value` prop should remain stable, as **the `Provider` component will ignore changes to the `value` prop**.

    Example:

    ```js
    const App = () => {
      // ❌ This is incorrect, initValue is a new value on each render, causing changes
      const initValue = {
        foo: 'foooo',
        bar: 'barrr',
      }
      // ✔ This is correct, using useMemo ensures initValue remains stable
      const initValue = React.useMemo(() => {
        return {
          foo: 'foooo',
          bar: 'barrr',
        }
      }, [])
      // ---------------------------------------------
      // ❌ This is also incorrect because the 'baz' property isn't in the initial context value
      const initValue = React.useMemo(() => {
        return {
          foo: 'foooo',
          bar: 'barrr',
          baz: 'bazzz', // Extra properties are not allowed
        }
      }, [])

      return (
        <AppContext.Provider value={initValue}>
          <YourComponent />
        </AppContext.Provider>
      )
    }
    ```

  - The `Provider` component also offers an `onChange` prop that accepts a callback function. This function is called whenever any value in the context changes. Here's an example:

    ```js
    function App() {
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
        <AppContext value={initValue} onChange={handleChange}>
          <YourComponent />
        </AppContext>
      )
    }
    ```

  - No `Consumer` component is provided; you can only access context values using the `useAtomicContext` hook.

- useAtomicContext

  - This method is a React hook that accepts the created context as a parameter and returns the current context value (passed to the `Provider` component via the `value` prop). Note that: **You must use object destructuring to read its returned values**.

    Example:

    ```js
    import { useAtomicContext } from 'react-atomic-context'

    function MyComponent() {
      // ✔ This is correct, reading values through destructuring
      const { foo, bar } = useAtomicContext(AppContext)
      if (foo) {
        return <div>{foo}</div>
      }
      return <div>{bar}</div>

      // ❌ This is wrong! Values must be read through destructuring
      const value = useAtomicContext(AppContext)
      if (value.foo) {
        return <div>{value.foo}</div>
      }
      return <div>{value.bar}</div>
    }
    ```

  - For each property in the `value`, there are two associated methods (in the form of 'get' or 'set' followed by the capitalized property name) for reading and writing that property's value. For example, for the property `foo`, you can use the `setFoo` method to change foo's value and the `getFoo` method to get foo's latest value. First, it's important to understand that calling the property's corresponding set method is the only way to change the property value. Second, regarding the get methods, they are only used to get the latest value of the property, which is different from directly reading the property value through destructuring. We'll explain this difference in detail below.

    Example:

    ```js
    function MyComponent() {
      const { foo, setFoo, getFoo, bar, setBar, getBar } = useAtomicContext(AppContext)
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

  - The property's set method supports passing an update function as a parameter, which will receive the current property value as a parameter. This is similar to the set method returned by React.useState. For example, for `{foo: 123}`, you can update foo's value either through `setFoo(124)` or through `setFoo(foo => foo + 1)`. Note that if the property value is a function type (although this is uncommon), the set method's parameter can only be in the form of an update function. For example, for `{foo: () => 123}`, you can only update it using something like `setFoo(() => () => 124)`.

  - Additionally, all property-related get and set methods are stable (i.e., reference stable), so you can omit these methods in some hooks' dependencies array.

    Example:

    ```js
    function MyComponent() {
      const { bar, setFoo, getFoo } = useAtomicContext(AppContext)
      React.useEffect(() => {
        if (getFoo() !== bar) {
          setFoo(bar)
        }
      }, [bar]) // getFoo and setFoo can be omitted
      return <div>...</div>
    }
    ```

  - Besides the property getters and setters methods, a `get` method is also provided. `get()` will return a snapshot of the current context value, **only for development and debugging purposes**.

    Example:

    ```js
    function MyComponent() {
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

## TypeScript Support

This library provides comprehensive TypeScript support.

```typescript
import type {
  AtomicContextGettersType,
  AtomicContextMethodsType,
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
 * Methods = {
 *  setFoo: (newValue: string) => void
 *  setBar: (newValue: number) => void
 *  setBaz: (newValue: boolean) => void
 *  getFoo: () => string
 *  getBar: () => number
 *  getBaz: () => boolean
 * }
 */
type Methods = AtomicContextMethodsType<typeof initValue>

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

1. What's the difference between getting a property value through the get method versus through destructuring?

   Getting property values through destructuring is the conventional approach, ensuring that the current component will re-render when the property value changes. Using the get method only returns the latest value of the property without establishing a connection between property changes and component re-renders.
   In some cases, we only want to get the latest value of a property without caring about its changes, in which case we need to use the get method instead of destructuring.

2. Why doesn't the Provider component respond to value changes?

   This is primarily to ensure a single source of data changes. The benefits include easier debugging and enhanced code maintainability and robustness. It also prevents the possibility of introducing additional properties.

3. Why must we use destructuring to read properties?

   As mentioned above, reading properties through destructuring will cause component re-renders when properties change. When you use destructuring to read properties, you're actually calling the `useContext` hook. According to hook calling rules, destructuring ensures that the reading order and quantity remain stable. Additionally, reading required properties uniformly at the top of your component is a good programming practice, allowing for clearer and more stable maintenance of your component's data dependencies.

4. Why is my component still re-rendering?

   First, an easily overlooked point is, **don't forget to use `React.useMemo` to wrap your component**.
   Of course, not just context, there are other factors that can cause component re-renders. For example, calling setState, using regular context, component key changes, etc.

## Important Notes

1. When creating context, you must pass an object type as the initial value, and the value passed to Provider cannot contain properties other than those in the initial value. This point has been mentioned in the API usage section.
2. Property get methods are "synchronous". For example, for the property `foo`, when you call `setFoo(123)` and immediately call `getFoo()`, it returns `123`. So if you use both destructuring and get method to obtain the same property value, there might be inconsistencies because the destructured value follows the conventional `React.useState` approach, which is "asynchronous".
3. Property set methods cannot be called directly in the component function, meaning "eager bailout" is not supported. This is equivalent to calling another component's setState method, which would cause React rendering issues.
4. Special attention is needed when a property's value is a function type. When modifying function-type properties, the set method must use a callback function that returns a method as its parameter. For example, for `{foo: () => 123}`, when modifying foo, you must call it like this: `setFoo(() => () => 456)`, not `setFoo(() => 456)`.

Finally, thank you very much for using this library. I hope it solves the issues you've encountered when using context. If you have any questions, please feel free to raise an issue.
