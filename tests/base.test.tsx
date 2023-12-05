import React from 'react'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { describe, it, afterEach } from 'node:test'
import { strict as assert } from 'node:assert'

import { createAtomicContext, useAtomicContext } from 'react-atomic-context'

const context = createAtomicContext({
  aaa: 'aaa',
  bbb: 'bbb'
})

const A = React.memo(function A() {
  const { aaa, setAaa } = useAtomicContext(context);
  const updateCount = React.useRef(1).current++
  return <div>
    <p data-testid="aaaa" onClick={() => {
      setAaa(aaa.toUpperCase() + updateCount)
    }}>{aaa}</p>
    <B />
  </div>
})

const B = React.memo(function B() {
  const { bbb, setBbb } = useAtomicContext(context);
  const updateCount = React.useRef(10).current++
  return <div>
    <p data-testid="bbbb" onClick={() => {
      setBbb('bbb' + updateCount)
    }}>{bbb}</p>
  </div>
})

function App() {
  const initValue = React.useMemo(() => {
    return {
      aaa: 'aaa',
      bbb: 'bibibi'
    }
  }, [])
  return (
    <context.Provider value={initValue}>
      <A />
    </context.Provider>
  )
}

describe('test-foo', () => {
  afterEach(() => {
    cleanup()
  })
  it('foo-test', () => {
    render(<App />)
    const p = screen.getByTestId('aaaa')
    assert.ok(p.textContent?.includes('aaa'))
    fireEvent.click(p)
    assert.equal(p.textContent, 'AAA1')
    fireEvent.click(p)
    assert.equal(p.textContent, 'AAA12')
    const pp = screen.getByTestId('bbbb');
    assert.ok(pp.textContent?.includes('bibibi'))
    fireEvent.click(pp)
    assert.equal(pp.textContent, 'bbb10')
    fireEvent.click(pp)
    assert.equal(pp.textContent, 'bbb11')
    assert.equal(p.textContent, 'AAA12')
  })
  // not concurrent mode
  it('foo-test', () => {
    assert.throws(() => {
      screen.getByTestId('aaaa')
    })

    render(<App />, { legacyRoot: true })
    const p = screen.getByTestId('aaaa')
    assert.ok(p.textContent?.includes('aaa'))
    fireEvent.click(p)
    assert.equal(p.textContent, 'AAA1')
    fireEvent.click(p)
    assert.equal(p.textContent, 'AAA12')
    const pp = screen.getByTestId('bbbb');
    assert.ok(pp.textContent?.includes('bibibi'))
    fireEvent.click(pp)
    assert.equal(pp.textContent, 'bbb10')
    fireEvent.click(pp)
    assert.equal(pp.textContent, 'bbb11')
    assert.equal(p.textContent, 'AAA12')
  })
})
