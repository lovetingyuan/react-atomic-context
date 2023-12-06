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
export const useTodoContextMethods = () => useAtomicContextMethods(TodoContext)

export const TodoProvider = TodoContext.Provider
