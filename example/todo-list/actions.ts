import React from 'react'
import { Status, useTodoContextMethods } from './context.ts'

// actions
export function useAddTodoItem() {
  const { getTodoList, setTodoList } = useTodoContextMethods()
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
  const { getTodoList, setTodoList } = useTodoContextMethods()
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
  const { getTodoList, setTodoList } = useTodoContextMethods()
  return (id: string) => {
    const list = getTodoList()
    setTodoList(list.filter(v => v.id !== id))
  }
}

export function useUpdateTitle() {
  const { getTodoList, setTodoList } = useTodoContextMethods()
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
