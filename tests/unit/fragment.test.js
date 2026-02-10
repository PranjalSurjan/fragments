const { Fragment } = require('../../src/model/fragment');

describe('Fragment Class', () => {
  const validOwnerId = 'user123';
  const validData = {
    ownerId: validOwnerId,
    type: 'text/plain',
  };

  test('should create a valid Fragment instance with default values', () => {
    const fragment = new Fragment(validData);
    expect(fragment.ownerId).toBe(validOwnerId);
    expect(fragment.type).toBe('text/plain');
    expect(fragment.id).toBeDefined();
    expect(fragment.created).toBeDefined();
    expect(fragment.updated).toBeDefined();
    expect(fragment.size).toBe(0);
  });

  test('should throw if ownerId is missing', () => {
    expect(() => new Fragment({ type: 'text/plain' })).toThrow();
  });

  test('should throw if type is missing', () => {
    expect(() => new Fragment({ ownerId: validOwnerId })).toThrow();
  });

  test('should throw if type is unsupported', () => {
    expect(() => new Fragment({ ownerId: validOwnerId, type: 'image/png' })).toThrow();
  });

  test('static isSupportedType() should return true for text/plain', () => {
    expect(Fragment.isSupportedType('text/plain')).toBe(true);
    expect(Fragment.isSupportedType('text/plain; charset=utf-8')).toBe(true);
  });

  test('save() should store metadata and return a Promise', async () => {
    const fragment = new Fragment(validData);
    await expect(fragment.save()).resolves.toBeUndefined();
  });

  test('setData() should update size and store binary data', async () => {
    const fragment = new Fragment(validData);
    const data = Buffer.from('Hello World');
    await fragment.setData(data);
    expect(fragment.size).toBe(data.length);

    const result = await fragment.getData();
    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.toString()).toBe('Hello World');
  });

  test('byId() should retrieve a fragment that exists', async () => {
    const fragment = new Fragment(validData);
    await fragment.save();
    const result = await Fragment.byId(validOwnerId, fragment.id);
    expect(result).toBeInstanceOf(Fragment);
    expect(result.id).toBe(fragment.id);
  });

  test('byId() should throw if fragment does not exist', async () => {
    await expect(Fragment.byId(validOwnerId, 'non-existent')).rejects.toThrow();
  });

  test('byUser() should return an array of IDs for a user', async () => {
    const f1 = new Fragment({ ownerId: 'userB', type: 'text/plain' });
    const f2 = new Fragment({ ownerId: 'userB', type: 'text/plain' });
    await f1.save();
    await f2.save();

    const ids = await Fragment.byUser('userB');
    expect(Array.isArray(ids)).toBe(true);
    expect(ids).toContain(f1.id);
    expect(ids).toContain(f2.id);
  });
});
