// src/model/fragment.js

const { nanoid } = require('nanoid');
const contentType = require('content-type');
const md = require('markdown-it')();
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

  /**
   * Static method to check if a type is supported
   * Supported: text/plain, text/markdown, text/html, application/json
   */
  static isSupportedType(value) {
    try {
      const { type } = contentType.parse(value);
      return [
        'text/plain',
        'text/markdown',
        'text/html',
        'application/json',
      ].includes(type);
    } catch (err) {
      return false;
    }
  }

  /**
   * Returns an array of mime types that this fragment can be converted to.
   * For now, only text/markdown supports an alternative (text/html).
   */
  get formats() {
    const { type } = contentType.parse(this.type);
    if (type === 'text/markdown') {
      return ['text/markdown', 'text/html'];
    }
    return [this.type];
  }

  /**
   * Returns true if the given extension is supported for this fragment's type.
   */
  static isSupportedExtension(ext) {
    const supportedExtensions = ['.txt', '.md', '.html', '.json'];
    return supportedExtensions.includes(ext.toLowerCase());
  }

  // Save this fragment instance's metadata to the DB
  save() {
    this.updated = new Date().toISOString();
    return writeFragment(this);
  }

  /**
   * Save the actual buffer data for this fragment
   * @param {Buffer} data 
   */
  async setData(data) {
    if (!Buffer.isBuffer(data)) {
      throw new Error('data must be a Buffer');
    }
    this.size = Buffer.byteLength(data);
    await this.save();
    return writeFragmentData(this.ownerId, this.id, data);
  }

  /**
   * Retrieve the raw data for this fragment
   */
  getData() {
    return readFragmentData(this.ownerId, this.id);
  }

  /**
   * Static method to find all fragments for a user
   * @param {string} ownerId 
   * @param {boolean} expand - whether to return full objects or just IDs
   */
  static byUser(ownerId, expand = false) {
    return listFragments(ownerId, expand);
  }

  /**
   * Static method to find a specific fragment by ID
   * @param {string} ownerId 
   * @param {string} id 
   */
  static async byId(ownerId, id) {
    const metadata = await readFragment(ownerId, id);
    if (!metadata) {
      throw new Error(`Fragment not found: ${id}`);
    }
    return new Fragment(metadata);
  }
}

module.exports = { Fragment };
