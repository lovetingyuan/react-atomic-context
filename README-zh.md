# react-atomic-context [![npm version](https://img.shields.io/npm/v/react-atomic-context)](https://www.npmjs.com/package/react-atomic-context)

当使用 `react context` 的时候我们通常面临两个主要的问题：

1. 当传递给`Provider`的 value 变化时，所有使用对应 context 的组件都会引起重渲染。对很多组件来讲，这种重渲染是不必要的。
2. 没有方便的方式去细粒度的更新某个属性

对于这些问题，这个库提供了一个简单的解决方案。它可以帮助你在 context 下的任意子组件中任意读写 value 中的任意属性，并且内置了一种类似于响应式追踪的机制来避免不必要的重渲染。

## 安装:

`npm i react-atomic-context`

打包大小 < `3kB`.
[![minified size](https://badgen.net/bundlephobia/min/react-atomic-context)](https://bundlephobia.com/package/react-atomic-context)

## 示例:

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

[![Open in CodeSandbox](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/p/sandbox/react-atomic-context-4mkp5t?file=%2Fsrc%2FApp.js%3A71%2C1)

上面的例子展示了`react-atomic-context`的用法。可以看出用法和原生的 React Context 基本一致。一些注意事项请你阅读下面的章节。

## API:

- createAtomicContext

  - 这个方法用来创建一个 "atomic" 的 context，类似于 `React.createContext`，但有一点不同的是：**必须给它传递一个对象值作为初始值**。
    示例:

    ```js
    import { createAtomicContext } from 'react-atomic-context'
    // createAtomicContext的参数必须是一个对象并且不能忽略
    const AppContext = createAtomicContext({
      foo: 'foo',
      bar: 'bar',
    })
    export { AppContext }
    ```

  - 创建好的 context 提供了 `Provider` 组件，它接收名为`value`的属性作为当前上下文的值。需要注意的是：**Provider 组件的`value`值必须和创建 context 时提供的初始值保持类型一致**，也就是 value 对象不能有任何额外的属性。另外需要注意的一点，保持`value`属性整体不会改变，**`Provider`组件会忽略`value`属性的变化**。
    例子:

    ```js
    const App = () => {
      // ❌ 下面的写法是错误的，initValue在组件每次渲染时都是全新的值，它发生了变化。
      const initValue = {
        foo: 'foooo',
        bar: 'barrr',
      }
      // ✔ 这才是正确的写法，使用useMemo保证了initValue不会变化
      const initValue = React.useMemo(() => {
        return {
          foo: 'foooo',
          bar: 'barrr',
        }
      }, [])
      // ---------------------------------------------
      // ❌ 下面的写法也是错误的，因为 `baz` 属性不在创建context的初始值中，属于额外的属性，这是不允许的。
      const initValue = React.useMemo(() => {
        return {
          foo: 'foooo',
          bar: 'barrr',
          baz: 'bazzz', // 不能有额外的属性
        }
      }, [])

      return (
        <AppContext.Provider value={initValue}>
          <YourComponent />
        </AppContext.Provider>
      )
    }
    ```

  - `Provider`组件同时额外提供了`onChange`属性，它接收一个方法作为值，当`value`中的任何值被更改时，这个方法会被调用。下面的例子展示了它的用法：

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

  - 不提供`Consumer`组件，只能通过使用`useAtomicContext`这个钩子来读取 context 的值。

- useAtomicContext

  - 这个方法是一个 react hook，它接收创建的 context 作为参数，返回当前 context 的值（通过`value`属性传递给`Provider`组件的值）。需要注意的是：**必须使用对象属性解构的方式读取它返回的值**。

    例子:

    ```js
    import { useAtomicContext } from 'react-atomic-context'

    cfunction MyComponent () {
      // ✔ 这是正确的做法，通过解构的方式读取值
      const { foo, bar } = useAtomicContext(AppContext)
      if (foo) {
        return <div>{foo}</div>
      }
      return <div>{bar}</div>

      // ❌ 这是错误的！只能通过解构的方式读取值
      const value = useAtomicContext(AppContext)
      if (value.foo) {
        return <div>{value.foo}</div>
      }
      return <div>{value.bar}</div>
    }```

  - 对于`value`中的每一个属性，都存在与之关联的两个方法（get 或者 set 加上属性名首字母大写转换后的形式）用来读写这个属性对应的值。例如对于属性`foo`，你可以使用`setFoo`方法来更改 foo 的值，可以使用`getFoo`方法来获取 foo 的最新值。首先需要明确的是调用属性对应的 set 方法是唯一更改属性值的方式。其次对于 get 方法，它们仅仅用来获取属性的最新值，这和通过解构直接读取属性值是有区别的，我们在下面会详细解释这一点。

    例子：

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

  - 属性的 set 方法支持传入一个更新函数作为参数，这个更新函数会接收当前的属性值作为参数。这和 React.useState 返回的 set 方法是一样的。例如对于`{foo: 123}`来讲，既可以通过`setFoo(124)`来更新 foo 的值，也可以通过`setFoo(foo => foo + 1)`来更新。需要额外注意的是，如果属性值是函数类型（虽然这并不常见），set 方法的参数就只能是更新函数的形式了。例如对于`{foo: () => 123}`来讲，只能通过`setFoo(() => (() => 124))`这样的方式来更新。

  - 另外需要说明的是，所有属性对应的 get 方法和 set 方法都是不会变化的（即引用稳定），所以你可以在一些 hook 的 dependencies array 中省略这些方法。

    例子：

    ```js
    function MyComponent() {
      const { bar, setFoo, getFoo } = useAtomicContext(AppContext)
      React.useEffect(() => {
        if (getFoo() !== bar) {
          setFoo(bar)
        }
      }, [bar]) // 可以不写 getFoo 和 setFoo
      return <div>...</div>
    }
    ```

  - 除了属性的 getters 和 setters 方法，还提供了名为`get`的方法。`get()`会返回当前 context 的 value 的快照，**仅供开发调试时使用**。

## TypeScript 支持

这个库提供了完备的 TypeScript 支持。

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

1. 通过 get 方法获取属性值和通过解构直接获取属性值有什么区别？

   通过解构的方式获取属性值是常规的做法，它可以保证当属性值变化时，当前组件会重渲染。而使用 get 方法仅仅返回属性的最新值，并不会建立属性变化和组件重渲染的联系。
   在有些情况下，我们仅仅想获取属性的最新值而并不关心它的变化，此时就需要使用 get 方法而不是解构的方式。

2. 为什么 Provider 组件不会响应 value 的变化？

   这主要是为了保证数据变化来源的唯一性。好处是便于调试以及增强代码的可维护性和健壮性。另外也避免了引入额外属性的可能性。

3. 为什么一定要用解构的方式来读取属性？

   上面我们提到了通过解构的方式读取属性会在属性变化时引起组件的重渲染。在你用解构的方式读取属性时，实际是在调用`useContext`这个钩子，根据 hook 的调用规则限制，解构的方式可以很好的保证读取的顺序和数量都是稳定不变的。另外在组件上方的位置统一读取需要的属性也是一个很好的编程实践，让你组件的数据依赖得到更清晰和稳定的维护。

4. 为什么我的组件还是在重渲染？

   首先容易忽略的一点是，**不要忘记使用`React.useMemo`去包装你的组件**。
   当然，不只是 context，还有其它的因素会造成组件的重渲染。例如调用了 setState、使用了常规的 context、组件的 key 发生了变化等。

## 注意事项

1. 创建 context 时必须传入对象类型的初始值，传递给 Provider 的 value 不能包含初始值所含属性之外的属性。这一点已经在 API 用法中提到了。
2. 属性的 get 方法是“同步的”。例如对于`foo`这个属性来讲，当你调用`setFoo(123)`后立即调用`getFoo()`，返回的就是`123`。所以如果你同时用解构的方式和调用 get 方法的方式来获取同一个属性值，有可能存在结果不一致的情况，因为解构的值是常规`React.useState`的做法，它是“异步的”。
3. 属性的 set 方法不能在组件函数中直接调用，也就是不支持“eager bailout”，这相当于调用其它组件的 setState 方法，会造成 react 的渲染问题。
4. 当某个属性的值是函数类型时需要特别注意。修改函数类型的属性时，set 方法必须使用返回方法的回调函数作为参数。例如`{foo: () => 123}`，当修改 foo 的时候必须这样调用：`setFoo(() => () => 456)`，而不能是`setFoo(() => 456)`。

最后非常感谢你使用这个库，希望它能解决你使用 context 遇到的困扰。有任何疑问请随时提 issue。
