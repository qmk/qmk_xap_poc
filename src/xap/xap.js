'use strict';

if (process.type === 'renderer') {
  module.exports = require('./renderer/xap-renderer');
} else {
  module.exports = require('./electron/xap-electron');
}
