import React from 'react'
import './style.css'

window.React = React

console.log('React version: ', React.version)

function App() {
  const app = new URLSearchParams(location.search).get('app')
  const [comp, setComp] = React.useState(<span></span>)
  React.useEffect(() => {
    if (!app) {
      return
    }
    import(`./${app}/index.tsx`).then(res => {
      setComp(React.createElement(res.default))
    })
  }, [app])
  return (
    <div>
      <h3>react-atomic-context examples:</h3>
      <ul>
        <li>
          <a href="./?app=base">base</a>
        </li>
        <li>
          <a href="./?app=todo-list">todo-list</a>
        </li>
      </ul>
      <hr />
      {comp}
    </div>
  )
}

async function start() {
  if (React.version.startsWith('18.')) {
    const ReactDOM = await import('react-dom/client')
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )
  } else {
    const ReactDOM = (await import('react-dom')).default
    ReactDOM.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
      document.getElementById('root')!
    )
  }
}

start()
