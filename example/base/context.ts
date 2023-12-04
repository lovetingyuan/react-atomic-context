import { createAtomicContext } from 'react-atomic-context'

const RootContext = createAtomicContext({
  one: 'one',
  two: 'two',
  three: 'three',
  four: 'four',
  five: 'five',
})

export { RootContext }
