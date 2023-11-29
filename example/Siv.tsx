import React from 'react'

function generateLightColor() {
  const r = Math.floor(Math.random() * 156 + 100) // 生成100到255之间的随机整数作为红色通道值
  const g = Math.floor(Math.random() * 156 + 100) // 生成100到255之间的随机整数作为绿色通道值
  const b = Math.floor(Math.random() * 156 + 100) // 生成100到255之间的随机整数作为蓝色通道值

  // 使用RGB通道值构建颜色字符串
  const color = 'rgba(' + r + ', ' + g + ', ' + b + ', 0.5)'

  return color
}

export default function Siv(
  props: React.PropsWithChildren<{
    title: string
  }>
) {
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const colorRef = React.useRef('')
  if (!colorRef.current) {
    colorRef.current = generateLightColor()
  }
  const timerRef = React.useRef<any>(0)
  const renderCount = React.useRef(0).current++
  // clearTimeout(timerRef.current)
  React.useEffect(() => {
    if (!renderCount) {
      return
    }
    if (containerRef.current) {
      containerRef.current.style.backgroundColor = colorRef.current
    }
    timerRef.current = setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.style.backgroundColor = 'white'
      }
    }, 500)
  })
  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        padding: 10,
        margin: 10,
        borderWidth: 5,
        borderStyle: 'solid',
        borderColor: 'gray',
        backgroundColor: 'white',
      }}
    >
      <span
        style={{
          position: 'absolute',
          right: 5,
          top: 0,
        }}
      >
        {props.title}: {renderCount}
      </span>
      {props.children}
    </div>
  )
}
