import React from 'react'
import { createAtomicContext, useAtomicContext } from '../src/index.ts'
import Siv from './Siv.tsx'
import { RootContext } from './context.ts'

const AppContext = createAtomicContext({
  foo: 'foo',
  bar: 'bar',
})

const Foo = React.memo(function Foo() {
  const { foo, setFoo, setBar } = useAtomicContext(AppContext)
  console.log('foo rendered')
  return (
    <Siv title="Foo">
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
    </Siv>
  )
})

const Bar = React.memo(function Bar() {
  const { bar, setBar } = useAtomicContext(AppContext)
  const { four, setFour } = useAtomicContext(RootContext)
  console.log('bar rendered')
  return (
    <Siv title="Bar">
      <p> this is bar: {bar} </p>
      <button
        onClick={() => {
          setBar(`bar${Math.random().toString().slice(0, 5)}`)
        }}
      >
        change bar
      </button>
      <p> this is four: {four} </p>
      <button
        onClick={() => {
          setFour(`four: ${Math.random().toString().slice(0, 5)}`)
        }}
      >
        change four
      </button>
    </Siv>
  )
})

export default function FooBar() {
  const initState = React.useMemo(() => {
    return {
      foo: 'foo',
      bar: 'bar',
    }
  }, [])
  return (
    <AppContext.Provider value={initState}>
      <Foo />
    </AppContext.Provider>
  )
}
