const request = require('supertest');
const app = require('../../src/app');

describe('POST /v1/fragments', () => {
  // We use a valid Base64 for Basic Auth (user1@email.com:password123)
  // Since we aren't in production, basic-auth.js will handle this.

  test('authenticated users should be able to create a plain text fragment', async () => {
    const data = 'This is a test fragment';
    const res = await request(app)
      .post('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1') // Use .auth helper
      .set('Content-Type', 'text/plain')
      .send(data);

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('ok');
  });


  test('unauthenticated requests should be rejected with 401', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .set('Content-Type', 'text/plain')
      .send('no auth here');

    expect(res.status).toBe(401);
    expect(res.body.status).toBe('error');
  });

  test('unsupported content types should return 415', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      // Use the same valid credentials as your success test
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'image/png')
      .send(Buffer.from([0x89, 0x50, 0x4e, 0x47])); // PNG header

    // Now it should bypass the 401 guard and hit the 415 logic
    expect(res.status).toBe(415);
    expect(res.body.status).toBe('error');
  });
});
