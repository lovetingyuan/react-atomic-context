# react-atomic-context

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

  - Used to create a context, similar to `React.createContext`, but it requires an object as the initial value.
  - The created context provides a Provider component, which wraps the components to be rendered. It must be provided with a prop named `value`, whose value is typically similar to the initial value and contains properties consistent with the initial value. Changing value of `value` prop won't take effect.
  - The Provider component also provides an additional `onChange` prop that accepts a function, which is called whenever any property changes.
  - There is no "Consumer" component available in `react-atomic-context`. We only support accessing the context through calling `useAtomicContext`.

- useAtomicContext
  - Used to retrieve the current value from the context (provided by the nearest Provider's `value` prop).
  - The value must be destructured, for example: `const { foo } = useAtomicContext(context)`.
  - For each property, there are two additional methods provided. Such as, for the property foo, both `getFoo` and `setFoo` methods are provided.
  - The `setFoo` method is used to update the value of the `foo` property, while `getFoo` is used solely to obtain the latest value of the `foo` property.
  - Accessor methods(getters and setters) are reference-stable and do not change, so you can confidently ignore them in dependency arrays.
  - Why provide `getFoo` when we can directly access the value of `foo`? In most cases, there is no need to use `getFoo`. Accessing `foo` directly through destructuring informs React that the current component's rendering depends on the value of `foo`. Thus, when `foo` changes, the current component will be re-rendered. However, there are situations where we only want to retrieve the value of `foo` without caring about its changes. In such cases, you should use the `getFoo` method.
  - Specifically, this hook will return a method named `get` that returns the whole current value of the context (read-only, like snapshot, for debugging purposes only).

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
 *  currentValue: {
 *    foo: string,
 *    bar: number,
 *    baz: boolean
 *  }
 * ) => void
 */
type OnChange = ProviderOnChangeType<typeof initValue>
```
