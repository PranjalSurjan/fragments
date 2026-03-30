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
        'application/json',
      ];
      return supportedTypes.includes(type);
    } catch {
      return false;
    }
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
