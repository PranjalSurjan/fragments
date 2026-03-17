// src/routes/api/getById.js
const path = require('path');
const md = require('markdown-it')();
const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');

module.exports = async (req, res) => {
  const { id } = req.params;
  const extension = path.extname(id);
  const fragmentId = path.basename(id, extension);

  try {
    const fragment = await Fragment.byId(req.user, fragmentId);
    let data = await fragment.getData();
    let contentType = fragment.type;

    if (extension) {
      // 1. Check if the extension is valid for this fragment's type
      // We use the 'formats' getter we added to the Fragment class earlier.
      const supportedExtensions = {
        'text/plain': ['.txt'],
        'text/markdown': ['.md', '.html'],
        'text/html': ['.html'],
        'application/json': ['.json'],
      };

      const allowedExtensions = supportedExtensions[fragment.type] || [];

      if (!allowedExtensions.includes(extension.toLowerCase())) {
        return res.status(415).json(createErrorResponse(415, `Cannot serve ${fragment.type} as ${extension}`));
      }

      // 2. Perform Conversion if necessary (Markdown to HTML)
      if (extension === '.html' && fragment.type === 'text/markdown') {
        data = Buffer.from(md.render(data.toString()));
        contentType = 'text/html';
      }
    }

    res.status(200)
      .set('Content-Type', contentType)
      .send(data);

  } catch (err) {
    res.status(404).json(createErrorResponse(404, err.message));
  }
};
