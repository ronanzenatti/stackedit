const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../node_modules/markdown-it-imsize/lib/imsize/index.js');
if (fs.existsSync(file)) {
  fs.writeFileSync(file, 'module.exports = function() { return { width: 0, height: 0 }; };\n');
  console.log('Patched markdown-it-imsize to remove node dependencies.');
}
