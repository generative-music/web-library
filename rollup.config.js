'use strict';

const babelPlugin = require('@rollup/plugin-babel');

const babel = babelPlugin.default;

const config = {
  input: './src/create-library.js',
  output: [
    {
      format: 'esm',
      file: `./dist/web-library.esm.js`,
    },
    {
      format: 'cjs',
      file: `./dist/web-library.cjs.js`,
      exports: 'auto',
    },
  ],
  external: [
    /@alexbainter\/indexed-db/,
    /@babel\/runtime/,
    /core-js/,
    /regenerator-runtime/,
  ],
  plugins: [babel({ babelHelpers: 'runtime' })],
};

module.exports = config;
