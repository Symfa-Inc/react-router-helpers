module.exports = {
  testMatch: ['**/__tests__/*-test.[jt]s?(x)'],
  transform: {
    '\\.[jt]sx?$': './jest-transformer.js',
  },
  setupFilesAfterEnv: ['./tests/__tests__/utils/setupTests.js'],
  testEnvironment: 'jsdom',
};
