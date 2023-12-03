import React from 'react'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { describe, it, afterEach, mock } from 'node:test'
import { strict as assert } from 'node:assert'
import {
  createAtomicContext,
  useAtomicContext,
  type ProviderOnChangeType,
} from 'react-atomic-context'

const init = {
  a: 'aaa',
  b: 'bbb',
}
const context = createAtomicContext(init)

const A = React.memo(function A() {
  const { a, setA } = useAtomicContext(context)
  const updateCount = React.useRef(1).current++
  return (
    <div>
      <p
        data-testid="dksflj"
        onClick={() => {
          setA('aaa' + updateCount)
        }}
      >
        {a}
      </p>
      <B />
    </div>
  )
})

const B = React.memo(function B() {
  const { b, setB } = useAtomicContext(context)
  const updateCount = React.useRef(10).current++
  return (
    <div>
      <p
        data-testid="rhdsf"
        onClick={() => {
          setB('bbb' + updateCount)
        }}
      >
        {b}
      </p>
    </div>
  )
})

function App(props: { onChange: ProviderOnChangeType<typeof init> }) {
  const initValue = React.useMemo(() => {
    return {
      a: 'aaa',
      b: 'bbb',
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
    const aa = screen.getByTestId('dksflj')
    const bb = screen.getByTestId('rhdsf')
    assert.strictEqual(onChange.mock.calls.length, 0)
    fireEvent.click(aa)
    assert.strictEqual(onChange.mock.calls.length, 1)
    const call = onChange.mock.calls[0]
    assert.deepStrictEqual(call.arguments, [{ key: 'a', value: 'aaa1', oldValue: 'aaa' }, {
      a: 'aaa1', b: 'bbb'
    }])
    fireEvent.click(bb)
    assert.strictEqual(onChange.mock.calls.length, 2)
    const call2 = onChange.mock.calls[1]
    assert.deepStrictEqual(call2.arguments, [{ key: 'b', value: 'bbb10', oldValue: 'bbb' }, {
      a: 'aaa1', b: 'bbb10'
    }])
    fireEvent.click(aa)
    assert.strictEqual(onChange.mock.calls.length, 3)
    const call3 = onChange.mock.calls[2]
    assert.deepStrictEqual(call3.arguments, [{ key: 'a', value: 'aaa2', oldValue: 'aaa1' }, {
      a: 'aaa2', b: 'bbb10'
    }])
    fireEvent.click(bb)
    assert.strictEqual(onChange.mock.calls.length, 4)
    const call4 = onChange.mock.calls[3]
    assert.deepStrictEqual(call4.arguments, [{ key: 'b', value: 'bbb11', oldValue: 'bbb10' }, {
      a: 'aaa2', b: 'bbb11'
    }])
  })
})
