// tests/unit/logger.test.js
const logger = require('../../src/logger');

describe('Logger', () => {
  test('logger should be defined and have standard levels', () => {
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.debug).toBe('function');
    expect(typeof logger.error).toBe('function');
  });
});
