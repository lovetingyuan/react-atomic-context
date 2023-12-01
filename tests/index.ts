import { readdirSync } from 'node:fs'
import 'global-jsdom/register'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const testDir = dirname(fileURLToPath(import.meta.url))
const regex = /^(?!_).+\.test\.tsx?$/
const testFiles = readdirSync(testDir).filter(f => regex.test(f))

await Promise.all(
  testFiles.map(f => {
    return import('./' + f)
  })
).catch(err => {
  console.error(err)
  throw err
})
