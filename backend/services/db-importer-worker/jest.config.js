/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // src/tests/ and dist/ contain E2E specs that require live MongoDB, Redis,
  // and FalkorDB clusters — exclude them from the unit test run
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/src/tests/'],
};