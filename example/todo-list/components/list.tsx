import React from 'react'
import TodoItem from './item.tsx'
import Siv from '../../Siv.tsx'
import { useDisplayList } from '../derives.ts'

const TodoList = React.memo(function TodoList() {
  const displayList = useDisplayList()
  return (
    <Siv title="list">
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
