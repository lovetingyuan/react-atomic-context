import { createStore } from 'react-atomic-context'

export const useBaseContext = createStore(
  {
    one: 'one',
    two: 'two',
    three: 'three',
    four: 'four',
    five: 'five',
    six: 6,
  },
  {
    onChange: ({ key, value, oldValue }) => {
      console.log('change', key, value, oldValue)
    },
  }
)
