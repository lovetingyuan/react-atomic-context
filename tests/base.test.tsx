import { strict as assert } from 'node:assert'
import { afterEach, describe, it } from 'node:test'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { createAtomicContext, useAtomicContext } from 'react-atomic-context'

const AppContext = createAtomicContext({
  aaa: 'aaa',
  bbb: 'bbb',
  ccc: () => 'c' as string,
})

const B = React.memo(() => {
  const { bbb, setBbb, getBbb } = useAtomicContext(AppContext)
  const updateCount = React.useRef(10).current++
  assert.equal(getBbb(), bbb)
  return (
    <div>
      <button
        data-testid="b-button"
        onClick={() => {
          setBbb(b => b + updateCount)
        }}
      >
        {bbb}
      </button>
    </div>
  )
})

const A = React.memo(() => {
  const { aaa, setAaa, getAaa, get } = useAtomicContext(AppContext)
  const updateCount = React.useRef(1).current++
  assert.equal(getAaa(), get().aaa)
  assert.equal(getAaa(), aaa)
  return (
    <div>
      <button
        data-testid="a-button"
        onClick={() => {
          setAaa(aaa + updateCount)
        }}
      >
        {aaa}
      </button>
      <B />
    </div>
  )
})

function App() {
  const initValue = React.useMemo(() => {
    return {
      aaa: 'aa',
      bbb: 'bb',
      ccc: () => 'cc',
    }
  }, [])
  return (
    <AppContext.Provider value={initValue}>
      <A />
    </AppContext.Provider>
  )
}

describe('test-base', () => {
  afterEach(() => {
    cleanup()
  })
  it('foo-test', () => {
    render(<App />)
    const aButton = screen.getByTestId('a-button')
    assert.equal(aButton.textContent, 'aa')
    fireEvent.click(aButton)
    assert.equal(aButton.textContent, 'aa1')
    fireEvent.click(aButton)
    assert.equal(aButton.textContent, 'aa12')
    const bButton = screen.getByTestId('b-button')
    assert.equal(bButton.textContent, 'bb')
    fireEvent.click(bButton)
    assert.equal(bButton.textContent, 'bb10')
    fireEvent.click(bButton)
    assert.equal(bButton.textContent, 'bb1011')

    assert.equal(aButton.textContent, 'aa12')
    fireEvent.click(aButton)
    assert.equal(aButton.textContent, 'aa123')
    assert.equal(bButton.textContent, 'bb1011')
    fireEvent.click(bButton)
    assert.equal(bButton.textContent, 'bb101112')
  })
})
