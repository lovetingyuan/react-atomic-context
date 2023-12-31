import React from 'react'
import Siv from '../Siv.tsx'
import { Provider, useBaseContext } from './context.ts'

const A = React.memo(() => {
  const { one, setOne, two, setTwo } = useBaseContext()
  return (
    <Siv title="AAA">
      <button
        onClick={() => {
          setOne(`one: ${Date.now().toString().slice(-3)}`)
        }}
      >
        {one}
      </button>
      <button
        onClick={() => {
          setTwo(`two: ${Date.now().toString().slice(-3)}`)
        }}
      >
        {two}
      </button>
      <B></B>
    </Siv>
  )
})

const B = React.memo(() => {
  const { three, setThree, setFive, five } = useBaseContext()
  return (
    <Siv title={'BBB'}>
      <button
        onClick={() => {
          setThree(`three: ${Date.now().toString().slice(-3)}`)
        }}
      >
        {three}
      </button>
      <button
        onClick={() => {
          setFive(`five: ${Date.now().toString().slice(-3)}`)
        }}
      >
        {five}
      </button>
      <C></C>
    </Siv>
  )
})

const C = React.memo(() => {
  const { four, two, setTwo, setFour, setFive, getFive, get: getContextValue } = useBaseContext()
  const [, seta] = React.useState(0)
  return (
    <Siv title="CCC">
      <button
        onClick={() => {
          seta(Math.random())
          console.log('current value', getContextValue())
        }}
      >
        sss
      </button>
      <button
        onClick={() => {
          setTwo(`two: ${Date.now().toString().slice(-3)}`)
        }}
      >
        {two}
      </button>
      <button
        onClick={() => {
          setFour(`four: ${Date.now().toString().slice(-3)}`)
        }}
      >
        {four}
      </button>
      <button
        onClick={() => {
          setFive(`five: ${Date.now().toString().slice(-3)}`)
        }}
      >
        {getFive()}
      </button>
    </Siv>
  )
})

export default function Root() {
  const init = React.useMemo(() => {
    return {
      one: 'one',
      two: 'two',
      three: 'three',
      four: 'four',
      five: 'five',
    }
  }, [])
  return (
    <Provider
      value={init}
      onChange={info => {
        console.log('value changed', info)
      }}
    >
      <h2>React Atomic Context</h2>
      <A></A>
    </Provider>
  )
}
