import React from 'react'
import { Status, useAddTodoItem, useTodoContext } from './context.ts'
import Siv from '../Siv.tsx'

const Header = React.memo(function Header() {
  const { setStatus, getStatus } = useTodoContext()
  const addTodoItem = useAddTodoItem()
  return (
    <Siv title="header">
      <form
        onSubmit={e => {
          e.preventDefault()
          const input = (e.target as any).elements.input
          const value = input.value.trim()
          if (value) {
            addTodoItem(value)
          }
          input.value = ''
        }}
      >
        <input placeholder="add new event" autoFocus required name="input" />
        <input type="submit" value="add" />
        {Object.values(Status).map(s => {
          return (
            <span key={s}>
              <input
                type="radio"
                id={s}
                name="status"
                defaultChecked={s === getStatus()}
                defaultValue={s}
                onChange={e => {
                  setStatus(e.target.value as Status)
                }}
              />
              <label htmlFor={s}>{s}</label>
            </span>
          )
        })}
      </form>
    </Siv>
  )
})

export default Header
