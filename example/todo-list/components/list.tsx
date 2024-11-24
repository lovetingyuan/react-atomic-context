import React from 'react'
import TodoItem from './item.tsx'
import Siv from '../../Siv.tsx'
import { useDisplayList } from '../derives.ts'
import { useTodoContext } from '../context.ts'

const TodoList = React.memo(function TodoList() {
  const displayList = useDisplayList()
  const { setTestFunc } = useTodoContext()
  setTestFunc(() => () => 3)
  return (
    <Siv title="list">
      <p
        onClick={() => {
          setTestFunc(() => (v: number) => {
            console.log('fffchanged', v)
          })
        }}
      >
        change test func
      </p>
      {displayList.length ? (
        <ol>
          {displayList.map(item => {
            return (
              <li key={item.id}>
                <TodoItem item={item}></TodoItem>
              </li>
            )
          })}
        </ol>
      ) : (
        <p>no content.</p>
      )}
    </Siv>
  )
})

export default TodoList
