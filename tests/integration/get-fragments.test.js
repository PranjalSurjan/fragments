// tests/integration/get-fragments.test.js
const request = require('supertest');
const app = require('../../src/app');

describe('GET /v1/fragments', () => {
  const data = Buffer.from('hello world');
  const type = 'text/plain';
  let fragmentId;

  // Use the credentials that are actually in your tests/.htpasswd
  const validUser = 'test-user1@fragments-testing.com';
  const validPassword = 'test-password1';

  beforeAll(async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth(validUser, validPassword)
      .set('Content-Type', type)
      .send(data);

    if (res.status === 201) {
      fragmentId = res.body.fragment.id;
    } else {
      throw new Error(`Failed to create fragment for tests: ${JSON.stringify(res.body)}`);
    }
  });

  test('authenticated users should be able to get a list of their fragments', async () => {
    const res = await request(app)
      .get('/v1/fragments')
      .auth(validUser, validPassword);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
    expect(res.body.fragments).toContain(fragmentId);
  });

  test('GET /v1/fragments?expand=1 should return full metadata objects', async () => {
    const res = await request(app)
      .get('/v1/fragments?expand=1')
      .auth(validUser, validPassword);

    expect(res.status).toBe(200);
    expect(res.body.fragments.some((f) => f.id === fragmentId)).toBe(true);
  });

  test('GET /v1/fragments/:id should return raw fragment data', async () => {
    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}`)
      .auth(validUser, validPassword);

    expect(res.status).toBe(200);
    expect(res.get('Content-Type')).toContain(type);
    // Use res.text instead of res.body.toString() for text fragments 
    expect(res.text).toBe('hello world');
  });

  test('GET /v1/fragments/:id/info should return fragment metadata', async () => {
    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}/info`)
      .auth(validUser, validPassword);

    expect(res.status).toBe(200);
    expect(res.body.fragment.id).toBe(fragmentId);
  });

  // --- Task 2: Conversion Tests ---

  test('GET /v1/fragments/:id.html should convert Markdown to HTML', async () => {
    // 1. Create a markdown fragment
    const mdData = Buffer.from('# Hello World');
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth(validUser, validPassword)
      .set('Content-Type', 'text/markdown')
      .send(mdData);

    expect(postRes.status).toBe(201);
    const mdId = postRes.body.fragment.id;

    // 2. Request it with .html extension
    const getRes = await request(app)
      .get(`/v1/fragments/${mdId}.html`)
      .auth(validUser, validPassword);

    expect(getRes.status).toBe(200);
    expect(getRes.get('Content-Type')).toContain('text/html');
    // markdown-it wraps # headers in <h1> tags
    expect(getRes.text).toContain('<h1>Hello World</h1>');
  });

  test('GET /v1/fragments/:id.json for a non-JSON fragment should return 415', async () => {
    // We try to request the plain text fragment (created in beforeAll) as .json
    const res = await request(app)
      .get(`/v1/fragments/${fragmentId}.json`)
      .auth(validUser, validPassword);

    expect(res.status).toBe(415);
    expect(res.body.status).toBe('error');
  });

  test('GET /v1/fragments/:id with invalid ID should return 404', async () => {
    const res = await request(app)
      .get('/v1/fragments/does-not-exist')
      .auth(validUser, validPassword);

    expect(res.status).toBe(404);
  });
});
