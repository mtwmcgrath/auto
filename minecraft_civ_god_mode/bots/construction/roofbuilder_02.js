/**
 * RoofBuilder #02
 * Part of the 100-bot army
 */

require('dotenv').config();
const { createBot } = require('../_common');

const BOT_ID = 'roofbuilder_02';

class RoofBuilder {
  constructor(botId = BOT_ID) {
    this.botId = botId;
    this.bot = null;
    this.isActive = false;
  }
  
  async initialize() {
    this.bot = createBot(this.botId);
    
    return new Promise((resolve) => {
      this.bot.once('spawn', () => {
        console.log(`✅ ${this.botId} spawned`);
        this.isActive = true;
        resolve();
      });
    });
  }
  
  getStatus() {
    return {
      id: this.botId,
      isActive: this.isActive
    };
  }
}

module.exports = { RoofBuilder };

if (require.main === module) {
  (async () => {
    const bot = new RoofBuilder();
    await bot.initialize();
  })();
}
