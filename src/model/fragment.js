// src/model/fragment.js

const { nanoid } = require('nanoid');
const contentType = require('content-type');
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
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

  // Static method to check if a type is supported
  static isSupportedType(value) {
    try {
      // Use the content-type library to parse the header (already imported)
      const { type } = contentType.parse(value);

      const supportedTypes = [
        'text/plain',
        'text/markdown',
        'text/html',
        'application/json'
      ];

      return supportedTypes.includes(type);
    } catch {
      return false;
    }
  }

  // Save this fragment instance's metadata to the DB
  save() {
    this.updated = new Date().toISOString();
    return writeFragment(this);
  }

  // Save the actual buffer data for this fragment
  async setData(data) {
    if (!Buffer.isBuffer(data)) {
      throw new Error('data must be a Buffer');
    }
    this.size = Buffer.byteLength(data);

    // Fix for Race Condition: await save() so metadata is persisted 
    await this.save();
    return writeFragmentData(this.ownerId, this.id, data);
  }

  // Retrieve the data for this fragment
  getData() {
    return readFragmentData(this.ownerId, this.id);
  }

  // Static method to find all fragments for a user
  /**
    * Returns an array of fragment ids or fragment objects for the given user
    * @param {string} ownerId user's sub
    * @param {boolean} expand whether to return full metadata objects or just ids
    * @returns {Promise<Array<string|Fragment>>}
    */
  static byUser(ownerId, expand = false) {
    return listFragments(ownerId, expand);
  }

  // Static method to find a specific fragment by ID
  static async byId(ownerId, id) {
    const metadata = await readFragment(ownerId, id);
    if (!metadata) {
      throw new Error(`Fragment not found: ${id}`);
    }
    return new Fragment(metadata);
  }
}

module.exports = { Fragment };
