import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';

export default [
  {
    input: 'src/index.ts',
    external: Object.keys(pkg.peerDependencies || {}),
    plugins: [
      typescript({
        typescript: require('typescript'),
        exclude: ['__tests__', '**/*-test.tsx', '__cy-tests__', '**/*.cy-test.tsx', 'components-for-test/*'],
      }),
    ],
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'esm' },
      {
        file: 'examples-for-development/for-development/src/reactRouterHelpers/index.js',
        format: 'es',
        banner: '/* eslint-disable */',
      },
      {
        file: 'examples-for-development/cypress-testing-app/src/reactRouterHelpers/index.js',
        format: 'es',
        banner: '/* eslint-disable */',
      },
    ],
  },
];
