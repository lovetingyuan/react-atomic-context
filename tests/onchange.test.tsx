import type { ProviderOnChangeType } from 'react-atomic-context'
import { strict as assert } from 'node:assert'
import { afterEach, describe, it, mock } from 'node:test'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { createAtomicContext, useAtomicContext } from 'react-atomic-context'

const init = {
  a: 'aaa',
  b: 'bbb',
}
const context = createAtomicContext(init)

const B = React.memo(() => {
  const { b, setB } = useAtomicContext(context)
  const updateCount = React.useRef(10).current++
  return (
    <div>
      <button
        type="button"
        data-testid="b-button"
        onClick={() => {
          setB(`B${updateCount}`)
        }}
      >
        {b}
      </button>
    </div>
  )
})

const A = React.memo(() => {
  const { a, setA } = useAtomicContext(context)
  const updateCount = React.useRef(1).current++
  return (
    <div>
      <button
        type="button"
        data-testid="a-button"
        onClick={() => {
          setA(`A${updateCount}`)
        }}
      >
        {a}
      </button>
      <B />
    </div>
  )
})

function App(props: { onChange: ProviderOnChangeType<typeof init> }) {
  const initValue = React.useMemo(() => {
    return {
      a: 'A',
      b: 'B',
    }
  }, [])
  return (
    <context.Provider value={initValue} onChange={props.onChange}>
      <A />
    </context.Provider>
  )
}

describe('onchange-test', () => {
  afterEach(() => {
    cleanup()
  })
  it('click-a-b', () => {
    const onChange = mock.fn()
    render(<App onChange={onChange} />)
    const aButton = screen.getByTestId('a-button')
    const bButton = screen.getByTestId('b-button')
    const baseCount = 0
    assert.strictEqual(onChange.mock.calls.length, baseCount)
    fireEvent.click(aButton)
    assert.strictEqual(onChange.mock.calls.length, baseCount + 1)
    const call = onChange.mock.calls[baseCount]
    assert.deepStrictEqual(call.arguments[0], {
      key: 'a',
      value: 'A1',
      oldValue: 'A',
      trace: undefined,
    })
    assert.deepStrictEqual(Object.keys(call.arguments[1]).sort(), ['getA', 'getB', 'setA', 'setB'])
    assert.deepStrictEqual(call.arguments[1].get(), { a: 'A1', b: 'B' })
    fireEvent.click(bButton)
    assert.strictEqual(onChange.mock.calls.length, baseCount + 2)
    const call2 = onChange.mock.calls[baseCount + 1]
    assert.deepStrictEqual(call2.arguments[0], {
      key: 'b',
      value: 'B10',
      oldValue: 'B',
      trace: undefined,
    })
    assert.deepStrictEqual(call2.arguments[1].get(), { a: 'A1', b: 'B10' })
    fireEvent.click(aButton)
    assert.strictEqual(onChange.mock.calls.length, baseCount + 3)
    const call3 = onChange.mock.calls[baseCount + 2]
    assert.deepStrictEqual(call3.arguments[0], {
      key: 'a',
      value: 'A2',
      oldValue: 'A1',
      trace: undefined,
    })
    assert.deepStrictEqual(call3.arguments[1].get(), { a: 'A2', b: 'B10' })
    fireEvent.click(bButton)
    assert.strictEqual(onChange.mock.calls.length, baseCount + 4)
    const call4 = onChange.mock.calls[baseCount + 3]
    assert.deepStrictEqual(call4.arguments[0], {
      key: 'b',
      value: 'B11',
      oldValue: 'B10',
      trace: undefined,
    })
    assert.deepStrictEqual(call4.arguments[1].get(), { a: 'A2', b: 'B11' })
  })
})
