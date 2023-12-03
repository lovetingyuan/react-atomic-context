import { readdirSync } from 'node:fs'
import 'global-jsdom/register'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import React from 'react'

globalThis.React = React

const testDir = dirname(fileURLToPath(import.meta.url))
const regex = /^(?!_).+\.test\.tsx?$/
const singleFile = process.argv[2]

const testFiles = readdirSync(testDir).filter(f => {
  if (!regex.test(f)) {
    return false
  }
  if (singleFile) {
    return `${singleFile}.test.tsx` === f
  }
  return true
})

if (!testFiles.length) {
  console.log('\x1b[38;5;214m%s\x1b[0m', 'no test files found.')
}

await Promise.all(
  testFiles.map(f => {
    return import('./' + f).then(() => {
      console.log('\x1b[36m%s\x1b[0m', f, 'test done:')
    })
  })
).catch(err => {
  console.error('test error:', err)
  throw err
})
