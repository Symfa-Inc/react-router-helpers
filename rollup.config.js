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
        file: 'example/example-for-test-only/src/reactRouterHelpers/index.js',
        format: 'es',
        banner: '/* eslint-disable */',
      },
    ],
  },
];
