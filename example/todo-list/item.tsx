import React from 'react'
import {
  Status,
  TodoItemType,
  useChangeStatus,
  useDeleteItem,
  useTodoContext,
  useUpdateTitle,
} from './context.ts'
import Siv from '../Siv.tsx'

const TodoItem = React.memo(function TodoItem(props: { item: TodoItemType }) {
  const { title, id, status } = props.item
  const { setEditingId, editingId, } = useTodoContext()
  const editing = editingId === id
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const changeStatus = useChangeStatus()
  const deleteItem = useDeleteItem()
  const updateTitle = useUpdateTitle()
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
            changeStatus(id, newStatus)
          }}
        >
          - {status}
        </span>
        {editing ? (
          <span
            onClick={() => {
              const newTitle = inputRef.current?.value.trim()
              if (newTitle) {
                updateTitle(id, newTitle)
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
              deleteItem(id)
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
