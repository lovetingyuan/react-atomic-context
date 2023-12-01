import fs from 'fs'
import path from 'path'
import 'global-jsdom/register'

const dirname = path.dirname(new URL(import.meta.url).pathname)
const regex = /^(?!_).+\.test\.tsx?$/
const testFiles = fs.readdirSync(dirname).filter(f => regex.test(f))

await Promise.all(
  testFiles.map(f => {
    return import('./' + f)
  })
)
