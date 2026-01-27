// tests/unit/app.test.js
const request = require('supertest');
const app = require('../../src/app');

describe('App Middleware', () => {
  test('requests for unknown resources should return HTTP 404', async () => {
    const res = await request(app).get('/no-such-path');

    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.error.code).toBe(404);
    expect(res.body.error.message).toBe('not found');
  });
});
