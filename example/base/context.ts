import { createAtomicContext, useAtomicContext } from 'react-atomic-context'

const RootContext = createAtomicContext({
  one: 'one',
  two: 'two',
  three: 'three',
  four: 'four',
  five: 'five',
})

export const useBaseContext = () => useAtomicContext(RootContext)
export const Provider = RootContext.Provider
