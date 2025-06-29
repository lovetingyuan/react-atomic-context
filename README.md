# react-atomic-context [![npm version](https://img.shields.io/npm/v/react-atomic-context)](https://www.npmjs.com/package/react-atomic-context)

When using `react context`, we usually face two main problems:

1. When the value passed to `Provider(context)` changes, all components using the corresponding context will cause re-renders. For many components, this re-rendering is unnecessary.
2. There is no convenient way to granularly update a specific property.

For these problems, this library provides a simple solution. It can help you read and write any property in the value from any child component under the context, and can ensure avoiding unnecessary re-renders.

## Installation:

`npm i react-atomic-context`

Bundle size < `3kB`.
[![minified size](https://badgen.net/bundlephobia/min/react-atomic-context)](https://bundlephobia.com/package/react-atomic-context)

Support React 19,18,17,16

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
      <button
        onClick={() => {
          setFoo(`foo${Math.random().toString().slice(0, 5)}`)
        }}
      >
        change foo : {foo}
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
      <button
        onClick={() => {
          setBar(`bar${Math.random().toString().slice(0, 5)}`)
        }}
      >
        change bar: {bar}
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

[![Open in CodeSandbox](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/p/sandbox/react-atomic-context-4mkp5t?file=%2Fsrc%2FApp.js%3A71%2C1)

The above example demonstrates the usage of `react-atomic-context`. You can see that the usage is basically consistent with native React Context. Please read the following sections for some important notes.

## API:

- **createAtomicContext**

  - This method is used to create an optimized context, similar to `React.createContext`, but with one difference: **you must pass an object value as the initial value**.
    Example:

    ```js
    import { createAtomicContext } from 'react-atomic-context'
    // The parameter of createAtomicContext must be an object and cannot be omitted
    const AppContext = createAtomicContext({
      foo: 'foo',
      bar: 'bar',
    })
    export { AppContext }
    ```

  - You need to wrap your components with the created Context. The Context component receives a property named `value` as the current context value. Note that: **The `value` of the Context component must maintain type consistency with the initial value provided when creating the context**, that is, the `value` object cannot have any additional properties. Also note that keep the `value` unchanged, even if it changes, it will be ignored.
    Example:

    ```js
    const App = () => {
      // ❌ The following is incorrect, initValue is a brand new value on every component render, it has changed.
      const initValue = {
        foo: 'foooo',
        bar: 'barrr',
      }
      // ✔ This is the correct way, ensuring the value property won't change
      const initValue = React.useMemo(() => {
        return {
          foo: 'foooo',
          bar: 'barrr',
        }
      }, [])
      // ---------------------------------------------
      // ❌ The following is also incorrect, because the `baz` property is not in the initial value when creating AppContext, it's an additional property, which is not allowed.
      const initValue = React.useMemo(() => {
        return {
          foo: 'foooo',
          bar: 'barrr',
          baz: 'bazzz', // Cannot have additional properties
        }
      }, [])

      return (
        <AppContext value={initValue}>
          <YourComponent />
        </AppContext>
      )
    }
    ```

  - The `Context` component also provides an additional `onChange` property, which accepts a method as a value. When any property value in `value` is changed, this method will be called. The following example shows its usage:

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

  - No `Consumer` component is provided, only the `useAtomicContext` hook can be used to read the context value.

---

- **useAtomicContext**

  - This method is a react hook that accepts the created context as a parameter and returns the current context value. Note that: **It is highly recommended to use object property destructuring to read the values it returns**.

    Example:

    ```js
    import { useAtomicContext } from 'react-atomic-context'

    function MyComponent() {
      // ✔ This is the correct approach, reading values through destructuring
      const { foo, bar } = useAtomicContext(AppContext)
      if (foo) {
        return <div>{foo}</div>
      }
      return <div>{bar}</div>

      // 🤔 If you are using React 19 or above, the following usage is also acceptable, but note that access to the value property can only occur during the component's synchronous rendering phase (following the same rules as `React.use`, because essentially each access to the value property is actually calling `React.use`).
      const value = useAtomicContext(AppContext)
      if (value.foo) {
        return <div>{value.foo}</div>
      }
      return (
        <div
          onClick={() => {
            console.log('this is bar', value.bar) // ❌ Cannot access context values in non-synchronous rendering parts of the component
            console.log('this is bar', value.getBar()) // ✔ Can use getter methods to get values
          }}
        >
          {value.bar}
        </div>
      )
    }
    ```

  - For each property in `value`, there are two associated methods (get or set plus the property name with the first letter capitalized) used to read and write the value corresponding to this property. For example, for the property `foo`, you can use the `setFoo` method to change the value of foo, and use the `getFoo` method to get the latest value of foo. First, it should be clear that calling the set method corresponding to the property is the only way to change the property value. Second, for get methods, they are only used to get the latest value of the property, which is different from reading the property value directly through destructuring, and we will explain this difference in detail below.

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

  - The set method of a property supports passing an update function as a parameter, and this update function will receive the current property value as a parameter. This is the same as the set method returned by React.useState. For example, for `{foo: 123}`, you can update the value of foo through `setFoo(124)`, or through `setFoo(foo => foo + 1)`.
    It should be noted that if the property value is a function type (although this is not common), the parameter of the set method can only be in the form of an update function. For example, for `{foo: () => 123}`, it can only be updated through `setFoo(() => (() => 124))`.

  - It should also be noted that all get and set methods corresponding to properties are unchanging (i.e., reference stable), so you can choose to omit these methods in the dependencies array of some hooks.

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

  - In addition to property getters and setters methods, a method named `get` is also provided. `get()` will return a snapshot of the current context's value, **only for development debugging purposes, do not depend on the value returned by get in your code**.

## TypeScript Support

This library provides complete TypeScript support. All you need to do is declare the complete type for the value property's value.
Usually, object literal values will be automatically inferred. But you can also use the `as` keyword to redeclare special types.

```typescript
import type { AtomicContextMethodsType, ContextOnChangeType } from 'react-atomic-context'

// The type of initValue will get correct automatic inference
const initValue = {
  foo: 'foo',
  bar: 123,
  baz: 0 as 0 | 1 | 2,
}

const context = createAtomicContext(initValue)

/**
 * Methods = {
 *  setFoo: (newValue: string | ((v: string) => string)) => void
 *  setBar: (newValue: number | ((v: number) => number)) => void
 *  setBaz: (newValue: 0 | 1 | 2 | ((v: 0 | 1 | 2) => 0 | 1 | 2))) => void
 *  getFoo: () => string
 *  getBar: () => number
 *  getBaz: () => 0 | 1 | 2
 * }
 */
type Methods = AtomicContextMethodsType<typeof initValue>

/**
 * type of "onChange" callback type passed to Context.
 *
 * OnChange = (
 *  changeInfo:
 *   | { key: 'foo', value: string, oldValue: string }
 *   | { key: 'bar', value: number, oldValue: number }
 *   | { key: 'baz', value: 0 | 1 | 2, oldValue: 0 | 1 | 2 }
 *  methods: {
 *    getFoo: () => string,
 *    setFoo: (v: string | (v: string) => string) => void,
 *    getBar: () => number,
 *    setBar: (v: number | (v: number) => number) => void,
 *    getBaz: () => 0 | 1 | 2,
 *    setBaz: (v: 0 | 1 | 2 | (v: 0 | 1 | 2) => 0 | 1 | 2) => void,
 *    get: () => { foo: string; bar: number; baz: 0 | 1 | 2 }
 *  }
 * ) => void
 */
type OnChange = ContextOnChangeType<typeof initValue>
```

Among them, `AtomicContextMethodsType` can constrain certain places to only access methods for reading and writing properties without accidentally depending on a certain value.

## Q&A

1. What is the difference between getting property values through getter methods and getting property values directly through destructuring?

   Getting property values through destructuring is the conventional approach, which can ensure that when the property value changes, the current component will re-render. Using getter methods only returns the latest value of the property and does not establish a connection between property changes and component re-rendering.
   In some cases, we only want to get the latest value of the property without caring about its changes, in which case we need to use getter methods instead of destructuring.

2. Why doesn't the Context component (or Provider) respond to changes in value?

   This is mainly to ensure the uniqueness of data change sources. The benefit is that it facilitates debugging and enhances code maintainability and robustness. It also avoids the possibility of introducing additional properties.

3. Why is destructuring recommended for reading properties?

   As mentioned above, reading properties through destructuring will cause component re-rendering when properties change. When you read properties, you are actually calling the `useContext` or `use` hook. According to the calling rules restrictions of hooks, destructuring can well ensure that the order and quantity of reading are stable and unchanging. Also, uniformly reading the required properties at the top of the component is a good programming practice, making the data dependencies of your components clearer and more stable to maintain.

   `React.use` supports conditional calling, so reading properties without destructuring is also possible, but it can only be read during the component's synchronous rendering process. Conditional reading will help react obtain more precise context dependency tracking.

4. Why is my component still re-rendering?

   First, an easily overlooked point is: **don't forget to use `React.useMemo` to wrap your components**.
   Second, it's not just context, there are other factors that can cause component re-rendering. For example, finally calling setState, third-party hooks, external storage subscribe, using regular context, component key changes, etc.

## Important Notes

1. When creating a context, you must pass an object type initial value. The value passed to the Context component cannot contain properties other than those contained in the initial value. This has been mentioned in the API usage.
2. Property getter methods are "synchronous". For example, for the `foo` property, when you call `setFoo(123)` and immediately call `getFoo()`, it returns `123`. So if you use both destructuring and calling getter methods to get the same property value, there may be inconsistent results, because the destructured value is returned by `React.useState`, which is "asynchronous".
3. Property setter methods cannot be called directly in component functions, that is, "eager bailout" is not supported. This is equivalent to calling another component's `setState` method, which will cause react rendering problems.
4. Special attention is needed when a property's value is a function type. When modifying function type properties, the setter method must use a callback function that returns a method as a parameter. For example, `{foo: () => 123}`, when modifying foo, you must call it like this: `setFoo(() => () => 456)`, not `setFoo(() => 456)`.

---

Thank you very much for using this library, and I hope it can solve the troubles you encounter when using context.
Actually, you can also completely treat it as a lightweight state management library.

Please feel free to raise issues if you have any questions.
