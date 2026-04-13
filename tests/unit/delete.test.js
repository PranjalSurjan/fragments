// tests/unit/delete.test.js
const request = require('supertest');
const app = require('../../src/app');

describe('DELETE /v1/fragments/:id', () => {
  test('unauthenticated requests are denied', () =>
    request(app).delete('/v1/fragments/someId').expect(401));

  test('authenticated user can delete a fragment', async () => {
    // First create a fragment
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'text/plain')
      .send('delete me');
    expect(postRes.status).toBe(201);
    const id = postRes.body.fragment.id;

    // Now delete it
    const deleteRes = await request(app)
      .delete(`/v1/fragments/${id}`)
      .auth('test-user1@fragments-testing.com', 'test-password1');
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.status).toBe('ok');
  });

  test('deleting a non-existent fragment returns 200', async () => {
    const res = await request(app)
      .delete('/v1/fragments/non-existent-id')
      .auth('test-user1@fragments-testing.com', 'test-password1');
    // DynamoDB/memory delete succeeds even for non-existent items
    expect(res.status).toBe(200);
  });
});
