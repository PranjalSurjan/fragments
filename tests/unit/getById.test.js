// tests/unit/getById.test.js
const request = require('supertest');
const app = require('../../src/app');

describe('GET /v1/fragments/:id', () => {
  test('unauthenticated requests are denied', () =>
    request(app).get('/v1/fragments/someId').expect(401));

  test('returns 404 for non-existent fragment', async () => {
    const res = await request(app)
      .get('/v1/fragments/non-existent-id')
      .auth('test-user1@fragments-testing.com', 'test-password1');
    expect(res.status).toBe(404);
  });

  test('returns fragment data with correct content type', async () => {
    // Create a fragment
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'text/plain')
      .send('hello world');
    expect(postRes.status).toBe(201);
    const id = postRes.body.fragment.id;

    // Get it back
    const res = await request(app)
      .get(`/v1/fragments/${id}`)
      .auth('test-user1@fragments-testing.com', 'test-password1');
    expect(res.status).toBe(200);
    expect(res.text).toBe('hello world');
    expect(res.headers['content-type']).toContain('text/plain');
  });

  test('converts markdown to html with .html extension', async () => {
    // Create a markdown fragment
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'text/markdown')
      .send('# Hello');
    expect(postRes.status).toBe(201);
    const id = postRes.body.fragment.id;

    // Get it as HTML
    const res = await request(app)
      .get(`/v1/fragments/${id}.html`)
      .auth('test-user1@fragments-testing.com', 'test-password1');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/html');
    expect(res.text).toContain('<h1>');
  });

  test('returns 415 for unsupported conversion', async () => {
    // Create a text fragment
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'text/plain')
      .send('hello');
    expect(postRes.status).toBe(201);
    const id = postRes.body.fragment.id;

    // Try invalid conversion
    const res = await request(app)
      .get(`/v1/fragments/${id}.html`)
      .auth('test-user1@fragments-testing.com', 'test-password1');
    expect(res.status).toBe(415);
  });

  test('converts JSON to YAML with .yaml extension', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'application/json')
      .send('{"key":"value"}');
    expect(postRes.status).toBe(201);
    const id = postRes.body.fragment.id;

    const res = await request(app)
      .get(`/v1/fragments/${id}.yaml`)
      .auth('test-user1@fragments-testing.com', 'test-password1');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('yaml');
  });
});
