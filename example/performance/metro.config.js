const path = require('path');

const config = require('../metro.config');

config.watchFolders = [
  ...config.watchFolders,
  path.resolve(__dirname, '../../test-app/performance'),
  path.resolve(__dirname, '../../test-app/assets'),
];

module.exports = config;
