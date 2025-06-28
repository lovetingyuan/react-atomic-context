import React from 'react'
import { createAtomicContext, useAtomicContext } from 'react-atomic-context'

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

function getInitValue() {
  return {
    route: 'todo-list' as 'todo-list' | 'about',
    todoList: [] as TodoItemType[],
    status: Status.all,
    editingId: '',
    testFunc: (v: number) => {
      console.log('test', v)
    },
  }
}

export type TodoListValueType = ReturnType<typeof getInitValue>

const TodoContext = createAtomicContext(getInitValue())

export const useTodoValue = () => {
  return React.useMemo(getInitValue, [])
}
export const useTodoContext = () => useAtomicContext(TodoContext)

export const TodoProvider = TodoContext.Provider
