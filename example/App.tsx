import React from 'react';
import { createAtomicContext, useAtomicContext } from '../src/index.ts';

const AppContext = createAtomicContext({
  foo: 'foo',
  bar: 'bar',
});

const Foo = React.memo(function Foo() {
  const { foo, setFoo, setBar } = useAtomicContext(AppContext);
  console.log('foo rendered');
  return (
    <div>
      <p> this is foo: {foo} </p>
      <button
        onClick={() => {
          setFoo(`foo${Math.random().toString().slice(0, 5)}`);
        }}
      >
        change foo
      </button>
      <button
        onClick={() => {
          setBar(`bar${Math.random().toString().slice(0, 5)}`);
        }}
      >
        change bar
      </button>
      <hr />
      <Bar />
    </div>
  );
});

const Bar = React.memo(function Bar() {
  const { bar, setBar } = useAtomicContext(AppContext);
  console.log('bar rendered');
  return (
    <div>
      <p> this is bar: {bar} </p>
      <button
        onClick={() => {
          setBar(`bar${Math.random().toString().slice(0, 5)}`);
        }}
      >
        change bar
      </button>
    </div>
  );
});

export default function App() {
  const initState = React.useMemo(() => {
    return {
      foo: 'foo',
      bar: 'bar',
    }
  }, []);
  return (
    <AppContext.Provider value={initState}>
      <Foo />
    </AppContext.Provider>
  );
}
