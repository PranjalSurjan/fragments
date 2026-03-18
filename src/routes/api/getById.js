// src/routes/api/getById.js
const path = require('path');
const md = require('markdown-it')();
const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');

module.exports = async (req, res) => {
  try {
    // 1. Parse the ID and the extension (e.g., "my-id.html" -> name: "my-id", ext: ".html")
    const { name: id, ext } = path.parse(req.params.id);

    // 2. Find the fragment metadata using the clean ID
    const fragment = await Fragment.byId(req.user, id);

    // 3. Get the raw binary data
    let data = await fragment.getData();
    let contentType = fragment.type;

    // 4. Conversion Logic if an extension is provided
    if (ext) {
      const extension = ext.toLowerCase();

      // Case: Markdown to HTML
      if (extension === '.html' && fragment.type === 'text/markdown') {
        data = Buffer.from(md.render(data.toString()));
        contentType = 'text/html';
      }
      // Case: Convert anything to .txt
      else if (extension === '.txt') {
        contentType = 'text/plain';
      }
      // Case: Invalid extension for the given fragment type
      // (e.g., asking for .html on a JSON fragment)
      else if (extension !== `.${fragment.type.split('/')[1]}`) {
        return res.status(400).json(
          createErrorResponse(400, `Cannot convert ${fragment.type} to ${extension}`)
        );
      }
    }

    // 5. Send the (potentially converted) data
    res.status(200)
      .set('Content-Type', contentType)
      .send(data);

  } catch (err) {
    // If Fragment.byId throws because the ID (after stripping extension) isn't found
    res.status(404).json(createErrorResponse(404, err.message));
  }
};
