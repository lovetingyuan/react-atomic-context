import React from 'react'
import { Status, useTodoContext } from './context.ts'

export function useDisplayList() {
  const { todoList, status } = useTodoContext()
  return React.useMemo(() => {
    if (status === Status.all) {
      return todoList
    }
    return todoList.filter(item => {
      return item.status === status
    })
  }, [todoList, status])
}
