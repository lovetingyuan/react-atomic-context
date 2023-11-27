import { createAtomicContext } from '../src/index.ts'

const RootContext = createAtomicContext({
  one: 'one',
  two: 'two',
  three: 'three',
  four: 'four',
  five: 'five',
})

export { RootContext }
