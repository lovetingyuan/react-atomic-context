import { TodoProvider, useTodoValue } from './context.ts'
import Header from './components/header.tsx'
import TodoList from './components/list.tsx'

export default function TodoListApp() {
  const value = useTodoValue()
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
