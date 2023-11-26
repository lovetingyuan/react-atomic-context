# react-atomic-context

You can use this library to individually read and write each property in React context without worrying about triggering a full re-render of all related components under the context.

Example:

```tsx
import React from 'react';
import { createAtomicContext, useAtomicContext } from 'react-atomic-context';

const AppContext = createAtomicContext({
  foo: 'foo',
  bar: 'bar',
});

const Foo = React.memo(function Foo() {
  const { foo, setFoo, setBar } = useAtomicContext(AppContext);
  console.log('foo rendered');
  return (
    <div>
      <p> this is foo: {foo} </p>
      <button
        onClick={() => {
          setFoo(`foo${Math.random().toString().slice(0, 5)}`);
        }}
      >
        change foo
      </button>
      <button
        onClick={() => {
          setBar(`bar${Math.random().toString().slice(0, 5)}`);
        }}
      >
        change bar
      </button>
      <hr />
      <Bar />
    </div>
  );
});

const Bar = React.memo(function Bar() {
  const { bar, setBar } = useAtomicContext(AppContext);
  console.log('bar rendered');
  return (
    <div>
      <p> this is bar: {bar} </p>
      <button
        onClick={() => {
          setBar(`bar${Math.random().toString().slice(0, 5)}`);
        }}
      >
        change bar
      </button>
    </div>
  );
});

export default function App() {
  const initState = React.useMemo(() => {
    return {
      foo: 'foo',
      bar: 'bar',
    };
  }, []);
  return (
    <AppContext.Provider
      value={initState}
      onChange={({ key, value, oldValue }) => {
        console.log(`${key} changed from ${oldValue} to ${value}`);
      }}
    >
      <Foo />
    </AppContext.Provider>
  );
}
```

Overall, the usage of `react-atomic-context` is similar to regular React context. First, you create a context. Then, you use its Provider to wrap the components you want to render. Within the component, you can read and modify the context value using the provided use hook.

API:

- createAtomicContext

  - Used to create a context, similar to `React.createContext`, but it requires an object as the initial value.
  - The created context provides a Provider component, which wraps the components to be rendered. It must be provided with a prop named `value`, whose value is typically similar to the initial value and contains properties consistent with the initial value.
  - The Provider component also provides an additional `onChange` prop that accepts a function, which is called whenever any property changes.
  - There is no "Consumer" component available in `react-atomic-context`. We only support accessing the context through the use of hook(`useAtomicContext`).

- useAtomicContext
  - Used to retrieve the current value from the context (provided by the nearest Provider's `value` prop).
  - The value must be destructured, for example: `const { foo } = useAtomicContext(context)`.
  - For each property, there are two additional methods provided. Such as, for the property foo, both `getFoo` and `setFoo` methods are provided.
  - The `setFoo` method is used to update the value of the `foo` property, while `getFoo` is used solely to obtain the latest value of the `foo` property.
  - Why provide `getFoo` when we can directly access the value of `foo`? In most cases, there is no need to use `getFoo`. Accessing `foo` directly through destructuring informs React that the current component's rendering depends on the value of `foo`. Thus, when `foo` changes, the current component will be re-rendered. However, there are situations where we only want to retrieve the value of `foo` without caring about its changes. In such cases, you should use the `getFoo` method.
