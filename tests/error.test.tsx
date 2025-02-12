import { strict as assert } from 'node:assert'
import { afterEach, describe, it } from 'node:test'
import { cleanup, render, screen } from '@testing-library/react'
import React from 'react'
import { createAtomicContext, useAtomicContext } from 'react-atomic-context'
import ErrorBoundary from './error-boundary'

const context = createAtomicContext({
  aaa: 'aaa',
  bbb: 'bbb',
})

const B = React.memo(() => {
  const { bbb, setBbb } = useAtomicContext(context)
  const updateCount = React.useRef(10).current++
  return (
    <div>
      <p
        data-testid="rhdsf"
        onClick={() => {
          setBbb(`bbb${updateCount}`)
        }}
      >
        {bbb}
      </p>
    </div>
  )
})

const A = React.memo(() => {
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

function App() {
  return (
    // @ts-expect-error aaa
    <context.Provider>
      <A />
    </context.Provider>
  )
}
function App3() {
  const val = React.useMemo(() => {
    return {
      foo: false,
      aaa: 'aaa',
    }
  }, [])
  return (
    // @ts-expect-error for test
    <context.Provider value={val}>
      <A />
    </context.Provider>
  )
}

describe('error-cases-test', () => {
  afterEach(() => {
    cleanup()
  })
  it('throws-no-provider', (t) => {
    t.mock.method(console, 'error', () => {})
    render(
      <ErrorBoundary>
        <A />
      </ErrorBoundary>,
    )
    assert.throws(() => {
      screen.getByTestId('dksflj')
    })
    const error = screen.getByTestId('error-msg')
    assert.ok(error.innerHTML.includes('wrapped by the Provider'))
  })
  it('throws-no-value', (t) => {
    t.mock.method(console, 'error', () => {})
    render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>,
    )
    const error = screen.getByTestId('error-msg')
    assert.ok(error.innerHTML.includes('is required and must be object'))
  })

  it('throws-no-exist-property', (t) => {
    t.mock.method(console, 'error', () => {})
    render(
      <ErrorBoundary>
        <App3 />
      </ErrorBoundary>,
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
      },
    )
  })
})
