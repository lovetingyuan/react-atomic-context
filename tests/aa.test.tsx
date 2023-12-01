import React from 'react'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { describe, it, afterEach } from 'node:test'
import { strict as assert } from 'node:assert'

function Bar(props: { url: string }) {
  const [count, setCount] = React.useState(0)
  return (
    <div>
      <div>
        <p data-testid="bar">this is bar: {props.url}</p>
        <button
          role="button"
          onClick={() => {
            setCount(count + 1)
          }}
        >
          {count}
        </button>
      </div>
    </div>
  )
}

describe('test-bar', t => {
  // This test passes because the Promise returned by the async
  // function is settled and not rejected.
  afterEach(() => {
    cleanup()
  })
  it('bar-url-test', () => {
    const url = '/about'
    render(<Bar url={url} />)
    const p = screen.getByTestId('bar')
    assert.ok(p.innerHTML.includes(url))
  })
  it('bar-click-test', () => {
    render(<Bar url={''} />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    fireEvent.click(button)
    assert.equal(button.textContent, '2')
  })
})
