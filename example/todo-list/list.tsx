import React from 'react'
import { Status, useTodoContext } from './context.ts'
import TodoItem from './item.tsx'
import Siv from '../Siv.tsx'

const TodoList = React.memo(function TodoList() {
  const { todoList, status } = useTodoContext()
  const displayList = React.useMemo(() => {
    if (status === Status.all) {
      return todoList;
    }
    return todoList.filter(item => {
      return item.status === status
    });
  }, [todoList, status])
  return (
    <Siv title='list'>
      {
        displayList.length ? <ol>
          {
            displayList.map(item => {
              return <li key={item.id}>
                <TodoItem item={item}></TodoItem>
              </li>
            })
          }
        </ol> : <p>no content.</p>
      }
    </Siv>
  )
})

export default TodoList
