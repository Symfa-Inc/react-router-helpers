import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';

export default [
  {
    input: 'src/index.ts',
    external: Object.keys(pkg.peerDependencies || {}),
    plugins: [
      typescript({
        typescript: require('typescript'),
        exclude: ['**/__tests__', '**/*-test.ts'],
      }),
    ],
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'esm' },
      {
        file: 'example/for-development/src/reactRouterHelpers/index.js',
        format: 'es',
        banner: '/* eslint-disable */',
      },
      {
        file: 'example/cypress-testing-app/src/reactRouterHelpers/index.js',
        format: 'es',
        banner: '/* eslint-disable */',
      },
    ],
  },
];
