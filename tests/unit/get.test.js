// tests/unit/get.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('GET /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should give a success result with a .fragments array
  test('authenticated users get a fragments array', async () => {
    const res = await request(app)
      .get('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });

  test('should fail to read fragment from DB if id or ownerId is missing', () => {
    const { readFragment } = require('../../src/model/data/memory/memory-db');

    // Since validateIds throws immediately (synchronously), 
    // we don't 'await' it or use '.rejects'.
    expect(() => readFragment(null, null)).toThrow('ownerId and id are required');
  });

  test('should allow deleting a fragment from the DB', async () => {
    const { writeFragment, deleteFragment, readFragment } = require('../../src/model/data/memory/memory-db');
    const fragment = { ownerId: 'del-user', id: '123' };

    // Testing lines 46-49 (deleteFragment)
    await writeFragment(fragment);
    await deleteFragment('del-user', '123');
    const result = await readFragment('del-user', '123');
    expect(result).toBeUndefined();
  });

  // TODO: we'll need to add tests to check the contents of the fragments array later
});
