import { execSync } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import React from 'react'
import 'global-jsdom/register'

globalThis.React = React

const testDir = dirname(fileURLToPath(import.meta.url))
const regex = /^(?!_).+\.test\.tsx?$/
const singleFile = process.argv[2]

if (!existsSync(join(testDir, 'node_modules'))) {
  execSync('npm install --no-package-lock', {
    cwd: testDir,
  })
}

const testFiles = readdirSync(testDir).filter((f) => {
  if (!regex.test(f)) {
    return false
  }
  if (singleFile) {
    return `${singleFile}.test.tsx` === f
  }
  return true
})

if (!testFiles.length) {
  console.warn('\x1B[38;5;214m%s\x1B[0m', 'no test files found.')
}

Promise.all(
  testFiles.map((f) => {
    return import(`./${f}`).then(() => {
      // eslint-disable-next-line no-console
      console.log('\x1B[36m%s\x1B[0m', f, 'test done:')
    })
  }),
).catch((err) => {
  console.error('test error:', err)
  throw err
})
