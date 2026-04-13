// tests/unit/stats.test.js
const request = require('supertest');
const app = require('../../src/app');

describe('GET /v1/fragments/stats', () => {
  test('unauthenticated requests are denied', () =>
    request(app).get('/v1/fragments/stats').expect(401));

  test('authenticated user gets stats', async () => {
    const res = await request(app)
      .get('/v1/fragments/stats')
      .auth('test-user1@fragments-testing.com', 'test-password1');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.stats).toBeDefined();
    expect(typeof res.body.stats.totalFragments).toBe('number');
    expect(typeof res.body.stats.totalSize).toBe('number');
    expect(typeof res.body.stats.byType).toBe('object');
  });

  test('stats reflect created fragments', async () => {
    // Create a fragment first
    await request(app)
      .post('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'text/plain')
      .send('stats test');

    const res = await request(app)
      .get('/v1/fragments/stats')
      .auth('test-user1@fragments-testing.com', 'test-password1');
    expect(res.status).toBe(200);
    expect(res.body.stats.totalFragments).toBeGreaterThan(0);
    expect(res.body.stats.byType['text/plain']).toBeGreaterThan(0);
  });
});
