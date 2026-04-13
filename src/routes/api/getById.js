// src/routes/api/getById.js
const path = require('path');
const mime = require('mime-types');
const md = require('markdown-it')();
const sharp = require('sharp');
const yaml = require('js-yaml');
const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    // 1. Parse the ID and the extension (e.g., "my-id.html" -> name: "my-id", ext: ".html")
    const { name: id, ext } = path.parse(req.params.id);

    // 2. Find the fragment metadata using the clean ID
    const fragment = await Fragment.byId(req.user, id);

    // 3. Get the raw binary data
    let data = await fragment.getData();
    let responseContentType = fragment.type;

    // 4. Conversion Logic if an extension is provided
    if (ext) {
      // Look up the target MIME type from the extension (e.g., .html -> text/html)
      const targetMimeType = mime.lookup(ext);

      if (!targetMimeType) {
        return res.status(415).json(createErrorResponse(415, `Unsupported extension: ${ext}`));
      }

      // Check if the conversion is valid for this fragment type
      const baseType = fragment.type.split(';')[0].trim();
      const validConversions = Fragment.validConversions(baseType);

      if (!validConversions.includes(targetMimeType)) {
        return res.status(415).json(
          createErrorResponse(415, `Cannot convert ${fragment.type} to ${targetMimeType}`)
        );
      }

      // Case: Image conversions using sharp
      if (fragment.type.startsWith('image/')) {
        const format = targetMimeType.split('/')[1];
        data = await sharp(data).toFormat(format).toBuffer();
        responseContentType = targetMimeType;
      }

      // Case: Markdown to HTML
      else if (fragment.type === 'text/markdown' && targetMimeType === 'text/html') {
        data = Buffer.from(md.render(data.toString()));
        responseContentType = 'text/html';
      }

      // Case: CSV to JSON
      else if (fragment.type === 'text/csv' && targetMimeType === 'application/json') {
        const lines = data.toString().trim().split('\n');
        const headers = lines[0].split(',').map((h) => h.trim());
        const rows = lines.slice(1).map((line) => {
          const values = line.split(',').map((v) => v.trim());
          return headers.reduce((obj, key, i) => {
            obj[key] = values[i];
            return obj;
          }, {});
        });
        data = Buffer.from(JSON.stringify(rows));
        responseContentType = 'application/json';
      }

      // Case: JSON to YAML
      else if (fragment.type === 'application/json' && targetMimeType === 'application/yaml') {
        data = Buffer.from(yaml.dump(JSON.parse(data.toString())));
        responseContentType = 'application/yaml';
      }

      // Case: Convert anything to .txt
      else if (targetMimeType === 'text/plain') {
        responseContentType = 'text/plain';
      }

      // Case: Same type (no conversion needed, e.g., .md -> text/markdown)
      else {
        responseContentType = targetMimeType;
      }
    }

    // 5. Send the (potentially converted) data
    logger.debug({ id, responseContentType }, 'Sending fragment data');
    res.status(200).set('Content-Type', responseContentType).send(data);
  } catch (err) {
    // If Fragment.byId throws because the ID (after stripping extension) isn't found
    logger.error({ err }, 'Error getting fragment by id');
    res.status(404).json(createErrorResponse(404, err.message));
  }
};
