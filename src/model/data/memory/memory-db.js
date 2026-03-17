//src/model/data/memory/memory-db.js

// Simple In-Memory Database using two Maps
const data = new Map();
const metadata = new Map();

// Helper to write data/metadata to the Maps
function validateIds(ownerId, id) {
  if (!(ownerId && id)) {
    throw new Error('ownerId and id are required');
  }
}

// All functions are async to mimic real database behavior
const writeFragment = (fragment) => {
  validateIds(fragment.ownerId, fragment.id);
  metadata.set(`${fragment.ownerId}:${fragment.id}`, fragment);
  return Promise.resolve();
};

const readFragment = (ownerId, id) => {
  validateIds(ownerId, id);
  return Promise.resolve(metadata.get(`${ownerId}:${id}`));
};

const writeFragmentData = (ownerId, id, value) => {
  validateIds(ownerId, id);
  data.set(`${ownerId}:${id}`, value);
  return Promise.resolve();
};

const readFragmentData = (ownerId, id) => {
  validateIds(ownerId, id);
  return Promise.resolve(data.get(`${ownerId}:${id}`));
};

// Returns an array of fragment IDs for a specific owner
/**
 * Returns an array of fragment IDs or expanded metadata for a specific owner
 * @param {string} ownerId 
 * @param {boolean} expand - whether to return full objects or just IDs
 */
const listFragments = (ownerId, expand = false) => {
  const values = Array.from(metadata.values()).filter((f) => f.ownerId === ownerId);

  // If expand is true, return the full metadata objects. 
  // Otherwise, return just the IDs.
  return Promise.resolve(expand ? values : values.map((f) => f.id));
};

const deleteFragment = (ownerId, id) => {
  validateIds(ownerId, id);
  metadata.delete(`${ownerId}:${id}`);
  data.delete(`${ownerId}:${id}`);
  return Promise.resolve();
};

module.exports = {
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
  listFragments,
  deleteFragment,
};
