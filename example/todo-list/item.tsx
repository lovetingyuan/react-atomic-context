import React from 'react'
import {
  Status,
  TodoItemType,
  changeStatusById,
  deleteById,
  updateItemTitle,
  useTodoContext,
} from './context.ts'
import Siv from '../Siv.tsx'

const TodoItem = React.memo(function TodoItem(props: { item: TodoItemType }) {
  const { title, id, status } = props.item
  const { setEditingId, editingId, setTodoList, getTodoList } = useTodoContext()
  const editing = editingId === id
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  return (
    <Siv title="item">
      <p>
        {editing ? <input ref={inputRef} defaultValue={title}></input> : <span>{title}</span>}
        <span
          onClick={() => {
            const newStatus =
              status === Status.todo
                ? Status.doing
                : status === Status.doing
                ? Status.done
                : Status.todo
            changeStatusById(id, newStatus, { setTodoList, getTodoList })
          }}
        >
          - {status}
        </span>
        {editing ? (
          <span
            onClick={() => {
              const newTitle = inputRef.current?.value.trim()
              if (newTitle) {
                updateItemTitle(id, newTitle, { setTodoList, getTodoList })
                setEditingId('')
              }
            }}
          >
            ✅
          </span>
        ) : (
          <span
            onClick={() => {
              setEditingId(id)
            }}
          >
            ✏️
          </span>
        )}
        <span
          onClick={() => {
            if (confirm('delete this?')) {
              deleteById(id, { getTodoList, setTodoList })
            }
          }}
        >
          ❌
        </span>
      </p>
    </Siv>
  )
})

export default TodoItem
