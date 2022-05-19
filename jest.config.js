module.exports = {
  testMatch: ['**/__tests__/*-test.[jt]s?(x)'],
  transform: {
    '\\.[jt]sx?$': './jest-transformer.js',
  },
  setupFilesAfterEnv: ['./src/__tests__/utils/setupTests.js'],
};
