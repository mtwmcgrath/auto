/**
 * Wall Builder #02
 * Part of 10-builder construction team
 */

require('dotenv').config();
const { createBot } = require('../_common');
const { WallBuilder } = require('./wall_builder_01');

const BUILDER_ID = 'wall_builder_02';

// Reuse implementation from builder_01
const builder = new WallBuilder(BUILDER_ID);

if (require.main === module) {
  (async () => {
    await builder.initialize();
    console.log(`✅ ${BUILDER_ID} ready to build walls!`);
  })();
}

module.exports = { builder };
