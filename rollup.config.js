import scss from 'rollup-plugin-scss'
import typescript from '@rollup/plugin-typescript'

import pkg from './package.json'

export default {
  input: 'src/index.tsx',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      exports: 'named',
      sourcemap: true,
      strict: false
    },
    {
      file: pkg.module,
      format: "esm",
      sourcemap: true
    }
  ],
  plugins: [scss(), typescript({ tsconfig: './tsconfig.json' })],
  external: ['react', 'react-dom']
}
