import React from 'react'
import { Status, TodoListValueType, TodoProvider } from './context.ts'
import Header from './components/header.tsx'
import TodoList from './components/list.tsx'

export default function TodoListApp() {
  const value = React.useMemo(() => {
    return {
      route: 'todo-list' as 'todo-list' | 'about',
      todoList: [],
      status: Status.all,
      editingId: '',
    } satisfies TodoListValueType
  }, [])
  return (
    <TodoProvider
      value={value}
      onChange={({ key, value, oldValue }, b) => {
        if (key === 'todoList') {
          if (value.length > 10) {
            alert('最多添加10条')
            b.setTodoList(oldValue)
          }
        }
      }}
    >
      <Header />
      <TodoList />
    </TodoProvider>
  )
}
