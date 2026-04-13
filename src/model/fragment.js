// src/model/fragment.js
const { nanoid } = require('nanoid');
const contentType = require('content-type');
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    if (!ownerId || !type) {
      throw new Error('ownerId and type are required');
    }
    if (!Fragment.isSupportedType(type)) {
      throw new Error(`Unsupported type: ${type}`);
    }
    this.id = id || nanoid();
    this.ownerId = ownerId;
    this.created = created || new Date().toISOString();
    this.updated = updated || new Date().toISOString();
    this.type = type;
    this.size = size;
  }

  static isSupportedType(value) {
    try {
      const { type } = contentType.parse(value);
      const supportedTypes = [
        'text/plain',
        'text/markdown',
        'text/html',
        'text/csv',
        'application/json',
        'application/yaml',
        'image/png',
        'image/jpeg',
        'image/webp',
        'image/avif',
        'image/gif',
      ];
      return supportedTypes.includes(type);
    } catch {
      return false;
    }
  }

  // Returns the valid conversion types for a given fragment type
  static validConversions(mimeType) {
    const conversions = {
      'text/plain': ['text/plain'],
      'text/markdown': ['text/markdown', 'text/html', 'text/plain'],
      'text/html': ['text/html', 'text/plain'],
      'text/csv': ['text/csv', 'text/plain', 'application/json'],
      'application/json': ['application/json', 'application/yaml', 'text/plain'],
      'application/yaml': ['application/yaml', 'text/plain'],
      'image/png': ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'],
      'image/jpeg': ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'],
      'image/webp': ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'],
      'image/avif': ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'],
      'image/gif': ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'],
    };
    return conversions[mimeType] || [];
  }

  save() {
    this.updated = new Date().toISOString();
    return writeFragment(this);
  }

  async setData(data) {
    if (!Buffer.isBuffer(data)) {
      throw new Error('data must be a Buffer');
    }
    this.size = Buffer.byteLength(data);
    await this.save();
    return writeFragmentData(this.ownerId, this.id, data);
  }

  getData() {
    return readFragmentData(this.ownerId, this.id);
  }

  static byUser(ownerId, expand = false) {
    return listFragments(ownerId, expand);
  }

  static async byId(ownerId, id) {
    const metadata = await readFragment(ownerId, id);
    if (!metadata) {
      throw new Error(`Fragment not found: ${id}`);
    }
    return new Fragment(metadata);
  }

  static delete(ownerId, id) {
    return deleteFragment(ownerId, id);
  }
}

module.exports = { Fragment };
