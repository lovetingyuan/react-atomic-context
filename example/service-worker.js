// 引入 Babel Standalone
importScripts('https://unpkg.com/@babel/standalone@7.23.4/babel.min.js');

// 转换 TSX 代码为 JavaScript 代码
function convertTsxToJs(tsxCode) {
  const transformedCode = Babel.transform(tsxCode, {
    presets: ['react', 'typescript'],
    filename: 'file.tsx',
  }).code;
  return transformedCode;
}

self.addEventListener('fetch', event => {
  if (event.request.url.endsWith('.tsx') || event.request.url.endsWith('.ts')) {
    event.respondWith(
      fetch(event.request)
        .then(response => response.text())
        .then(tsxCode => {
          // 将 TSX 代码转换为 JavaScript 代码
          const javascriptCode = convertTsxToJs(tsxCode);

          // 创建新的 Response 对象，将转换后的 JavaScript 代码作为响应内容
          const convertedResponse = new Response(javascriptCode, {
            status: 200,
            headers: {
              'Content-Type': 'application/javascript',
            },
          });

          return convertedResponse;
        })
        .catch(error => {
          console.error('Error converting TSX to JS:', error);
          // 如果发生错误，可以返回适当的错误响应
        })
    );
  }
});
