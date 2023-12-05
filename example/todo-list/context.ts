import React from 'react'
import {
  createAtomicContext,
  useAtomicContext,
  useAtomicContextMethods,
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

export function useAddTodoItem() {
  const { getTodoList, setTodoList } = useAtomicContextMethods(TodoContext)
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

export function useChangeStatus() {
  const { getTodoList, setTodoList } = useTodoContext()
  return (id: string, status: Status) => {
    const list = getTodoList()
    const index = list.findIndex(v => v.id === id)
    const item = list[index]
    list[index] = {
      ...item,
      status,
    }
    setTodoList([...list])
  }
}

export function useDeleteItem() {
  const { getTodoList, setTodoList } = useTodoContext()
  return (id: string) => {
    const list = getTodoList()
    setTodoList(list.filter(v => v.id !== id))
  }
}

export function useUpdateTitle() {
  const { getTodoList, setTodoList } = useTodoContext()
  return (id: string, title: string) => {
    const list = getTodoList()
    const index = list.findIndex(v => v.id === id)
    const item = list[index]
    list[index] = {
      ...item,
      title,
    }
    setTodoList([...list])
  }
}
