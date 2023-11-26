import React from 'react';
import { createAtomicContext, useAtomicContext } from '../src/index.ts';

function generateLightColor() {
  const r = Math.floor(Math.random() * 156 + 100); // 生成100到255之间的随机整数作为红色通道值
  const g = Math.floor(Math.random() * 156 + 100); // 生成100到255之间的随机整数作为绿色通道值
  const b = Math.floor(Math.random() * 156 + 100); // 生成100到255之间的随机整数作为蓝色通道值

  // 使用RGB通道值构建颜色字符串
  const color = 'rgba(' + r + ', ' + g + ', ' + b + ', 0.5)';

  return color;
}

function Siv(
  props: React.PropsWithChildren<{
    title: string;
  }>
) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const colorRef = React.useRef('');
  if (!colorRef.current) {
    colorRef.current = generateLightColor();
  }
  const timerRef = React.useRef(0);
  const renderCount = React.useRef(0).current++;
  const [, update] = React.useState({});
  // clearTimeout(timerRef.current)
  React.useEffect(() => {
    if (!renderCount) {
      return;
    }
    if (containerRef.current) {
      containerRef.current.style.backgroundColor = colorRef.current;
    }
    timerRef.current = setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.style.backgroundColor = 'white';
      }
    }, 500);
  });
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
        resize: 'both',
        overflow: 'auto',
      }}
    >
      <button
        onClick={() => update({})}
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
        }}
      >
        {props.title}: {renderCount}
      </button>
      {props.children}
    </div>
  );
}


const A = React.memo(() => {
  const { one, setOne, two, setTwo, } = useAtomicContext(RootContext);
  return (
    <Siv title="AAA">
      <button
        onClick={() => {
          setOne(`one: ${Date.now().toString().slice(-3)}`)
        }}
      >
        {one}
      </button>
      <button
        onClick={() => {
          setTwo(`two: ${Date.now().toString().slice(-3)}`)
        }}
      >
        {two}
      </button>
      <B></B>
    </Siv>
  );
});

const B = React.memo(() => {
  const a = useAtomicContext(RootContext);
  const { three, setThree, setFive, five } = a
  return (
    <Siv title={'BBB'}>
      <button
        onClick={() => {
          setThree(`three: ${Date.now().toString().slice(-3)}`)
        }}
      >
        {three}
      </button>
      <button
        onClick={() => {
          setFive(`five: ${Date.now().toString().slice(-3)}`)
        }}
      >
        {five}
      </button>

      <C></C>
    </Siv>
  );
});

const C = React.memo(() => {
  const { four, two, setTwo, setFour, setFive, getFive } = useAtomicContext(RootContext);
  const [, seta] = React.useState(0);
  return (
    <Siv title="CCC">
      <button onClick={() => seta(Math.random())}>sss</button>
      <button
        onClick={() => {
          setTwo(`two: ${Date.now().toString().slice(-3)}`)
        }}
      >
        {two}
      </button>
      <button
        onClick={() => {
          setFour(`four: ${Date.now().toString().slice(-3)}`)
        }}
      >
        {four}
      </button>
      <button
        onClick={() => {
          setFive(`five: ${Date.now().toString().slice(-3)}`)
        }}
      >
        {getFive()}
      </button>
    </Siv>
  );
});

const RootContext = createAtomicContext({
  one: 'one',
  two: 'two',
  three: 'three',
  four: 'four',
  five: 'five',
});

export default function Root() {
  const init = React.useMemo(() => {
    return {
      one: 'one',
      two: 'two',
      three: 'three',
      four: 'four',
      five: 'five',
      // s: 2,
    };
  }, [])
  return (
    <RootContext.Provider
      value={init}
    >
      <h2>React Atomic Context</h2>
      <A></A>
    </RootContext.Provider>
  );
}
