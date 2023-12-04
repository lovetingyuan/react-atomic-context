import React from "react";
import { Status, TodoListValueType, TodoProvider } from "./context.ts";
import Header from "./header.tsx";
import TodoList from './list.tsx'

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
    <TodoProvider value={value}>
      <Header />
      <TodoList />
    </TodoProvider>
  )
}
