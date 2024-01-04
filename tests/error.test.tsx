import React from 'react'
import { render, screen, cleanup } from '@testing-library/react'
import { describe, it, afterEach } from 'node:test'
import { strict as assert } from 'node:assert'
import { createAtomicContext, useAtomicContext } from 'react-atomic-context'
import ErrorBoundary from './error-boundary'

const context = createAtomicContext({
  aaa: 'aaa',
  bbb: 'bbb',
})

const A = React.memo(function A() {
  const { aaa, setAaa } = useAtomicContext(context)
  const updateCount = React.useRef(1).current++
  return (
    <div>
      <p
        data-testid="dksflj"
        onClick={() => {
          setAaa(aaa.toUpperCase() + updateCount)
        }}
      >
        {aaa}
      </p>
      <B />
    </div>
  )
})

const B = React.memo(function B() {
  const { bbb, setBbb } = useAtomicContext(context)
  const updateCount = React.useRef(10).current++
  return (
    <div>
      <p
        data-testid="rhdsf"
        onClick={() => {
          setBbb('bbb' + updateCount)
        }}
      >
        {bbb}
      </p>
    </div>
  )
})

function App() {
  return (
    // @ts-expect-error aaa
    <context.Provider>
      <A />
    </context.Provider>
  )
}
function App3() {
  return (
    <context.Provider
      value={{
        // @ts-expect-error aaa
        foo: false,
      }}
    >
      <A />
    </context.Provider>
  )
}

describe('error-cases-test', () => {
  afterEach(() => {
    cleanup()
  })
  it('throws-no-provider', t => {
    t.mock.method(console, 'error', () => {})
    render(
      <ErrorBoundary>
        <A />
      </ErrorBoundary>
    )
    assert.throws(() => {
      screen.getByTestId('dksflj')
    })
    const error = screen.getByTestId('error-msg')
    assert.ok(error.innerHTML.includes('wrapped by the Provider'))
  })
  it('throws-no-value', t => {
    t.mock.method(console, 'error', () => {})
    render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    )
    const error = screen.getByTestId('error-msg')
    assert.ok(error.innerHTML.includes('is required and must be object'))
  })

  it('throws-no-exist-property', t => {
    t.mock.method(console, 'error', () => {})
    render(
      <ErrorBoundary>
        <App3 />
      </ErrorBoundary>
    )
    const error = screen.getByTestId('error-msg')
    assert.ok(error.innerHTML.includes('does not exist in the initial value'))
  })
  it('throws-no-empty-property', () => {
    assert.throws(
      () => {
        // @ts-expect-error aaa
        createAtomicContext()
      },
      {
        message: /is required and must be object/,
      }
    )
  })
})
