import React from 'react'
import { render, screen, cleanup } from '@testing-library/react'
import { describe, it, afterEach } from 'node:test'
import { strict as assert } from 'node:assert'

function Foo(props: { url: string }) {
  return <p data-testid="foo">this is foo: {props.url}</p>
}

describe('test-foo', t => {
  // This test passes because the Promise returned by the async
  // function is settled and not rejected.
  afterEach(() => {
    cleanup()
  })
  it('foo-test', () => {
    const url = '/greeting'
    render(<Foo url={url} />)
    const p = screen.getByTestId('foo')
    assert.ok(p.innerHTML.includes(url))
  })
})
