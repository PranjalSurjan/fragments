// tests/unit/put.test.js
const request = require('supertest');
const app = require('../../src/app');

describe('PUT /v1/fragments/:id', () => {
  test('unauthenticated requests are denied', () =>
    request(app).put('/v1/fragments/someId').expect(401));

  test('authenticated user can update a fragment', async () => {
    // First create a fragment
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'text/plain')
      .send('original content');
    expect(postRes.status).toBe(201);
    const id = postRes.body.fragment.id;

    // Now update it
    const putRes = await request(app)
      .put(`/v1/fragments/${id}`)
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'text/plain')
      .send('updated content');
    expect(putRes.status).toBe(200);
    expect(putRes.body.status).toBe('ok');
    expect(putRes.body.fragment.size).toBe(15);
  });

  test('cannot change the type of a fragment', async () => {
    // First create a text fragment
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'text/plain')
      .send('original content');
    expect(postRes.status).toBe(201);
    const id = postRes.body.fragment.id;

    // Try to update with a different type
    const putRes = await request(app)
      .put(`/v1/fragments/${id}`)
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'application/json')
      .send('{"key":"value"}');
    expect(putRes.status).toBe(400);
  });

  test('updating a non-existent fragment returns 404', async () => {
    const res = await request(app)
      .put('/v1/fragments/non-existent-id')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'text/plain')
      .send('content');
    expect(res.status).toBe(404);
  });
});
