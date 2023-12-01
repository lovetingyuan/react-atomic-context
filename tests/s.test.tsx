import React from 'react'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { describe, it, afterEach } from 'node:test'
import { strict as assert } from 'node:assert'

import { createAtomicContext, useAtomicContext } from 'react-atomic-context'

const context = createAtomicContext({
  aaa: 'aaa'
})

const A = React.memo(function A() {
  const { aaa, setAaa } = useAtomicContext(context);
  const updateCount = React.useRef(1).current++
  return <div>
    <p data-testid="dksflj" onClick={() => {
      setAaa(aaa.toUpperCase() + updateCount)
    }}>{aaa}</p>
  </div>
})

function App() {
  const initValue = React.useMemo(() => {
    return {
      aaa: 'aaa'
    }
  }, [])
  return (
    <context.Provider value={initValue}>
      <A />
    </context.Provider>
  )
}

describe('test-foo', t => {
  afterEach(() => {
    cleanup()
  })
  it('foo-test', () => {
    render(<App />)
    const p = screen.getByTestId('dksflj')
    assert.ok(p.textContent?.includes('aaa'))
    fireEvent.click(p)
    assert.equal(p.textContent, 'AAA1')
    fireEvent.click(p)
    assert.equal(p.textContent, 'AAA12')
  })
})
