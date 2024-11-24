// 引入 Babel Standalone
importScripts('https://unpkg.com/@babel/standalone@7.23.4/babel.min.js')

self.addEventListener('install', event => {
  event.waitUntil(
    self.skipWaiting() // 立即激活新的 Service Worker
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    self.clients
      .claim()
      .then(() => {
        return self.clients.matchAll()
      })
      .then(clients => {
        clients.forEach(client => {
          client.postMessage('refresh')
        })
      })
  )
})

// 转换 TSX 代码为 JavaScript 代码
function convertTsxToJs(tsxCode) {
  const transformedCode = Babel.transform(tsxCode, {
    presets: ['react', 'typescript'],
    filename: 'file.tsx',
  }).code
  return transformedCode
}

function convertCssToJs(cssCode) {
  return `
const style = document.createElement('style');
style.textContent = \`${cssCode}\`;
document.head.appendChild(style);
export default style;
`.trim()
}

function convertJsonToJs(code) {
  const json = JSON.parse(code)
  const keys = Object.keys(json).map(key => {
    try {
      new Function(`var ${key};`)
      return key
    } catch (e) {
      return ''
    }
  })
  return `
const __$JSon = ${code}
export default __$JSon
export const {${keys}} = __$JSon
`.trim()
}

const fileExts = ['tsx', 'ts', 'css', 'json']

self.addEventListener('fetch', event => {
  const url = event.request.url
  if (url.startsWith('https://')) {
    return
  }
  if (fileExts.some(v => url.endsWith('.' + v))) {
    event.respondWith(
      fetch(event.request)
        .then(response => response.text())
        .then(code => {
          let javascriptCode = ''
          if (url.endsWith('.tsx') || url.endsWith('.ts')) {
            // 将 TSX 代码转换为 JavaScript 代码
            javascriptCode = convertTsxToJs(code)
          } else if (url.endsWith('.css')) {
            javascriptCode = convertCssToJs(code)
          } else if (url.endsWith('.json')) {
            javascriptCode = convertJsonToJs(code)
          }
          // 创建新的 Response 对象，将转换后的 JavaScript 代码作为响应内容
          const convertedResponse = new Response(javascriptCode, {
            status: 200,
            headers: {
              'Content-Type': 'application/javascript',
            },
          })
          return convertedResponse
        })
        .catch(error => {
          console.error('Error converting TSX to JS:', error)
          // 如果发生错误，可以返回适当的错误响应
        })
    )
  }
})
