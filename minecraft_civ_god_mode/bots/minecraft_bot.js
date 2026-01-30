const mineflayer = require('mineflayer');
const { getCommandBus } = require('../src/command_bus');

// Config từ server.properties của bạn
const BOT_CONFIG = {
  host: 'localhost',      // Server IP
  port: 25565,            // Server port
  username: '9woke',      // Tên bot (offline mode)
  version: '1.21.1',      // Version Minecraft của bạn
  auth: 'offline'         // Vì online-mode=false
};

class MinecraftBot {
  constructor() {
    this.bot = null;
    this.commandBus = getCommandBus();
    this.isReady = false;
  }

  async spawn() {
    console.log('✅ 🎮 Minecraft bot spawning...');
    
    // Tạo bot
    this.bot = mineflayer.createBot(BOT_CONFIG);

    // Khi bot login thành công
    this.bot.on('spawn', () => {
      console.log(`✅ Bot "${this.bot.username}" joined the server!`);
      this.isReady = true;
      this.startListening();
    });

    // Khi bot bị kick
    this.bot.on('kicked', (reason) => {
      console.error('⚠️ Bot kicked:', reason);
    });

    // Khi có lỗi
    this.bot.on('error', (err) => {
      console.error('❌ Bot error:', err);
    });

    // Khi có tin nhắn chat
    this.bot.on('chat', (username, message) => {
      if (username === this.bot.username) return;
      console.log(`💬 ${username}: ${message}`);
    });
  }

  startListening() {
    console.log('ℹ️ Listening for commands...');

    // Lắng nghe commands từ Director Bot
    this.commandBus.on('COMMAND', async (cmd) => {
      await this.executeCommand(cmd);
    });
  }

  async executeCommand(cmd) {
    if (!this.isReady) {
      console.warn('⚠️ Bot not ready yet');
      return;
    }

    console.log(`🎮 Executing: ${cmd.action}`, cmd.params);

    switch (cmd.action) {
      case 'MOVE':
        await this.move(cmd.params);
        break;
      
      case 'BUILD':
        await this.build(cmd.params);
        break;
      
      case 'MINE':
        await this.mine(cmd.params);
        break;
      
      case 'CHAT':
        this.bot.chat(cmd.params.message);
        break;
      
      case 'ATTACK':
        await this.attack(cmd.params);
        break;

      default:
        console.warn(`⚠️ Unknown action: ${cmd.action}`);
    }
  }

  async move(params) {
    const { x, y, z } = params;
    const goal = new (require('mineflayer-pathfinder').goals.GoalNear)(x, y, z, 1);
    
    try {
      await this.bot.pathfinder.goto(goal);
      console.log(`✅ Moved to ${x}, ${y}, ${z}`);
    } catch (err) {
      console.error('❌ Move failed:', err.message);
    }
  }

  async build(params) {
    const { blockType, x, y, z } = params;
    // Logic xây dựng (cần inventory có block)
    console.log(`🏗️ Building ${blockType} at ${x}, ${y}, ${z}`);
  }

  async mine(params) {
    const { x, y, z } = params;
    const block = this.bot.blockAt(new (require('vec3'))(x, y, z));
    
    if (block) {
      try {
        await this.bot.dig(block);
        console.log(`⛏️ Mined ${block.name}`);
      } catch (err) {
        console.error('❌ Mining failed:', err.message);
      }
    }
  }

  async attack(params) {
    const { targetName } = params;
    const entity = this.bot.players[targetName]?.entity;
    
    if (entity) {
      this.bot.attack(entity);
      console.log(`⚔️ Attacking ${targetName}`);
    }
  }
}

// Spawn bot
if (require.main === module) {
  const bot = new MinecraftBot();
  bot.spawn();
}

module.exports = MinecraftBot;