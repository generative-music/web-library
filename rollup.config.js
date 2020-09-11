'use strict';

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
  external: [/@alexbainter\/indexed-db/],
};

module.exports = config;
