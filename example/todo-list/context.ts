import React from 'react'
import {
  AtomicContextGettersType,
  AtomicContextSettersType,
  createAtomicContext,
  useAtomicContext,
} from 'react-atomic-context'

export enum Status {
  todo = 'todo',
  doing = 'doing',
  done = 'done',
  all = 'all',
}

export type TodoItemType = {
  title: string
  id: string
  status: Status
}

const initValue = {
  route: 'todo-list' as 'todo-list' | 'about',
  todoList: [] as TodoItemType[],
  status: Status.all,
  editingId: '',
}

export type TodoListValueType = typeof initValue

const TodoContext = createAtomicContext(initValue)

export const useTodoContext = () => useAtomicContext(TodoContext)
export const TodoProvider = TodoContext.Provider

type ListAction = AtomicContextGettersType<TodoListValueType, 'todoList'> &
  AtomicContextSettersType<TodoListValueType, 'todoList'>

export function useAddTodoItem() {
  const { getTodoList, setTodoList } = useTodoContext()
  return React.useCallback((title: string) => {
    const todoList = getTodoList()
    setTodoList(
      todoList.concat({
        id: Math.random().toString(),
        title,
        status: Status.todo,
      })
    )
  }, [])
}

// export function addTodoItem(title: string, ctx: ListAction) {
//   const todoList = ctx.getTodoList()
//   ctx.setTodoList(
//     todoList.concat({
//       id: Math.random().toString(),
//       title,
//       status: Status.todo,
//     })
//   )
// }

export function changeStatusById(id: string, status: Status, ctx: ListAction) {
  const list = ctx.getTodoList()
  const index = list.findIndex(v => v.id === id)
  const item = list[index]
  list[index] = {
    ...item,
    status,
  }
  ctx.setTodoList([...list])
}

export function deleteById(id: string, ctx: ListAction) {
  const list = ctx.getTodoList()
  ctx.setTodoList(list.filter(v => v.id !== id))
}

export function updateItemTitle(id: string, title: string, ctx: ListAction) {
  const list = ctx.getTodoList()
  const index = list.findIndex(v => v.id === id)
  const item = list[index]
  list[index] = {
    ...item,
    title,
  }
  ctx.setTodoList([...list])
}
