import React from 'react'
import { Status, useTodoContext } from './context.ts'

// actions
export function useAddTodoItem() {
  const { setTodoList } = useTodoContext()
  return React.useCallback((title: string) => {
    setTodoList(list => {
      return list.concat({
        id: Math.random().toString(),
        title,
        status: Status.todo,
      })
    })
  }, [])
}

export function useChangeStatus() {
  const { setTodoList } = useTodoContext()
  return (id: string, status: Status) => {
    setTodoList(list => {
      const index = list.findIndex(v => v.id === id)
      const item = list[index]
      list[index] = {
        ...item,
        status,
      }
      return [...list]
    })
  }
}

export function useDeleteItem() {
  const { setTodoList } = useTodoContext()
  return (id: string) => {
    setTodoList(list => list.filter(v => v.id !== id))
  }
}

export function useUpdateTitle() {
  const { setTodoList } = useTodoContext()
  return (id: string, title: string) => {
    setTodoList(list => {
      const index = list.findIndex(v => v.id === id)
      const item = list[index]
      list[index] = {
        ...item,
        title,
      }
      return [...list]
    })
  }
}
