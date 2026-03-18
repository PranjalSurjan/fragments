const request = require('supertest');
const app = require('../../src/app');

describe('GET /v1/fragments', () => {
  const user = 'test-user-get@email.com';
  const pass = 'test-password-get';

  test('should return an empty list if user has no fragments', async () => {
    const res = await request(app)
      .get('/v1/fragments')
      .auth(user, pass);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragments).toEqual([]);
  });

  test('should return expanded metadata when ?expand=1 is used', async () => {
    // 1. Create a fragment first
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(user, pass)
      .set('Content-Type', 'text/plain')
      .send('testing expansion');

    const fragmentId = postRes.body.fragment.id;

    // 2. Get the expanded list
    const res = await request(app)
      .get('/v1/fragments?expand=1')
      .auth(user, pass);

    expect(res.status).toBe(200);
    // Check that we got an object with the right ID
    const found = res.body.fragments.find(f => f.id === fragmentId);
    expect(found).toBeDefined();
    expect(typeof found).toBe('object');
    expect(found.type).toBe('text/plain');
  });

  test('GET /v1/fragments/:id should return the raw data', async () => {
    const content = 'raw data test';
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(user, pass)
      .set('Content-Type', 'text/plain')
      .send(content);

    const res = await request(app)
      .get(`/v1/fragments/${postRes.body.fragment.id}`)
      .auth(user, pass);

    expect(res.status).toBe(200);
    expect(res.text).toBe(content);
    expect(res.headers['content-type']).toContain('text/plain');
  });

  test('GET /v1/fragments/:id/info should return the metadata', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(user, pass)
      .set('Content-Type', 'text/plain')
      .send('info test');

    const res = await request(app)
      .get(`/v1/fragments/${postRes.body.fragment.id}/info`)
      .auth(user, pass);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment.id).toBe(postRes.body.fragment.id);
  });

  test('should return 404 for a non-existent fragment id', async () => {
    const res = await request(app)
      .get('/v1/fragments/does-not-exist')
      .auth(user, pass);

    expect(res.status).toBe(404);
  });
});
