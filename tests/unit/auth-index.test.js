// tests/unit/auth-index.test.js

describe('Auth Strategy Selector', () => {
  // Save the original env
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules(); // This is the secret sauce to re-run the index.js logic
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('should throw an error if both Cognito and Basic Auth are set', () => {
    process.env.AWS_COGNITO_POOL_ID = 'id';
    process.env.AWS_COGNITO_CLIENT_ID = 'client';
    process.env.HTPASSWD_FILE = 'file';

    expect(() => require('../../src/auth/index')).toThrow(
      'env contains configuration for both AWS Cognito and HTTP Basic Auth. Only one is allowed.'
    );
  });

  test('should throw an error if no auth variables are set', () => {
    delete process.env.AWS_COGNITO_POOL_ID;
    delete process.env.AWS_COGNITO_CLIENT_ID;
    delete process.env.HTPASSWD_FILE;

    expect(() => require('../../src/auth/index')).toThrow(
      'missing env vars: no authorization configuration found'
    );
  });
});
