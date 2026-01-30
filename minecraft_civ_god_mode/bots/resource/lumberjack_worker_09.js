/**
 * Lumberjack Worker #09
 * Part of 20-worker lumberjack squad
 */

require('dotenv').config();
const { createBot } = require('../_common');
const { LumberjackWorker } = require('./lumberjack_worker_01');

const WORKER_ID = 'lumberjack_worker_09';

// Reuse implementation from worker_01
const worker = new LumberjackWorker(WORKER_ID);

if (require.main === module) {
  (async () => {
    await worker.initialize();
    console.log(`✅ ${WORKER_ID} ready to work!`);
  })();
}

module.exports = { worker };
