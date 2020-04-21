import { terser } from 'rollup-plugin-terser'
import json from '@rollup/plugin-json'
import fs from 'fs-extra'

fs.emptyDirSync('./dist')
fs.copy('./assets', './dist')

const plugins = [terser(), json()]

export default [
  {
    input: './src/content.js',
    output: {
      file: './dist/content.js',
      format: 'iife',
    },
    plugins,
  },
  {
    input: './src/background.js',
    output: {
      file: './dist/background.js',
      format: 'iife',
    },
    plugins,
  },
]
