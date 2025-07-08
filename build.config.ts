import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: ['./src/index'],
  declaration: true,
  name: 'index',
  failOnWarn: false,
  sourcemap: false,
  clean: true,
  rollup: {
    emitCJS: true,
  },
})

// export default defineBuildConfig([
//   {
//     entries: ['./src/index'],
//     declaration: true,
//     name: 'index',
//     failOnWarn: false,
//     sourcemap: true,
//     clean: true,
//     rollup: {
//       emitCJS: true,
//     },
//   },
//   {
//     entries: ['./src/index'],
//     declaration: false,
//     failOnWarn: false,
//     sourcemap: true,
//     clean: false,
//     rollup: {
//       esbuild: {
//         minify: true,
//       },
//       output: {
//         dir: 'dist',
//         format: 'umd',
//         entryFileNames: 'index.umd.js',
//         name: 'ReactAtomicContext',
//         globals: {
//           react: 'React',
//         },
//       },
//     },
//   },
// ])
