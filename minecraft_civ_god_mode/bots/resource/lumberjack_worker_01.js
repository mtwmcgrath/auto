/**
 * Lumberjack Worker #01
 * One of 20 lumberjack workers in the Resource Army
 * Automatically chops wood in assigned zone and replants
 */

require('dotenv').config();
const { createBot, sleep } = require('../_common');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const { collectBlock } = require('mineflayer-collectblock');
const { Vec3 } = require('vec3');

const WORKER_ID = 'lumberjack_worker_01';
const LEADER_ID = 'LumberjackLeader';

class LumberjackWorker {
  constructor(workerId = WORKER_ID) {
    this.workerId = workerId;
    this.bot = null;
    this.mcData = null;
    this.zone = null; // Assigned zone from leader
    this.logsCollected = 0;
    this.saplingsPlanted = 0;
    this.isWorking = false;
    
    console.log(`🪓 ${this.workerId} initializing...`);
  }
  
  /**
   * Initialize the worker bot
   */
  async initialize() {
    this.bot = createBot(this.workerId);
    this.bot.loadPlugin(pathfinder);
    this.bot.loadPlugin(collectBlock);
    
    return new Promise((resolve) => {
      this.bot.once('spawn', async () => {
        this.mcData = require('minecraft-data')(this.bot.version);
        const movements = new Movements(this.bot, this.mcData);
        this.bot.pathfinder.setMovements(movements);
        
        console.log(`✅ ${this.workerId} spawned`);
        
        // Register with squad leader (in real implementation)
        // await this.registerWithLeader();
        
        resolve();
      });
    });
  }
  
  /**
   * Set assigned zone
   */
  setZone(zone) {
    this.zone = zone;
    console.log(`📍 ${this.workerId} assigned to zone ${zone.id}`);
    console.log(`   Area: (${zone.minX},${zone.minZ}) to (${zone.maxX},${zone.maxZ})`);
  }
  
  /**
   * Start working - chop trees in assigned zone
   */
  async startWork() {
    if (!this.zone) {
      console.error(`❌ ${this.workerId}: No zone assigned!`);
      return;
    }
    
    console.log(`🪓 ${this.workerId} starting work in zone ${this.zone.id}...`);
    this.isWorking = true;
    
    while (this.isWorking) {
      try {
        // 1. Move to zone center
        await this.moveToZone();
        
        // 2. Find and chop trees
        await this.chopTreesInZone();
        
        // 3. Replant saplings
        await this.replantSaplings();
        
        // 4. Deposit logs to chest
        await this.depositLogs();
        
        // 5. Brief rest
        await sleep(2000);
        
      } catch (error) {
        console.error(`❌ ${this.workerId} error:`, error.message);
        await sleep(5000);
      }
    }
  }
  
  /**
   * Move to assigned zone
   */
  async moveToZone() {
    if (!this.zone) return;
    
    const { centerX, centerZ } = this.zone;
    const y = 70; // Default y level
    
    const goal = new goals.GoalNear(centerX, y, centerZ, 3);
    await this.bot.pathfinder.goto(goal);
  }
  
  /**
   * Find and chop trees in zone
   */
  async chopTreesInZone() {
    // Equip best axe
    await this.equipBestAxe();
    
    // Find logs in zone
    const logs = this.findLogsInZone(12); // Find up to 12 logs
    
    if (logs.length === 0) {
      console.log(`🌲 ${this.workerId}: No trees in zone, waiting...`);
      await sleep(5000);
      return;
    }
    
    console.log(`🪓 ${this.workerId}: Found ${logs.length} logs to chop`);
    
    // Chop logs
    try {
      await this.bot.collectBlock.collect(logs);
      this.logsCollected += logs.length;
      console.log(`✅ ${this.workerId}: Chopped ${logs.length} logs (total: ${this.logsCollected})`);
    } catch (error) {
      console.warn(`⚠️ ${this.workerId}: Error chopping:`, error.message);
    }
  }
  
  /**
   * Find logs within assigned zone
   */
  findLogsInZone(maxCount = 12) {
    if (!this.zone) return [];
    
    const logTypes = Object.values(this.mcData.blocksByName)
      .filter(b => b.name.endsWith('_log'))
      .map(b => b.id);
    
    const positions = this.bot.findBlocks({
      matching: (block) => block && logTypes.includes(block.type),
      maxDistance: 32,
      count: maxCount
    });
    
    // Filter positions to only those in our zone
    const logsInZone = positions.filter(pos => {
      return pos.x >= this.zone.minX && pos.x < this.zone.maxX &&
             pos.z >= this.zone.minZ && pos.z < this.zone.maxZ;
    });
    
    return logsInZone.map(pos => this.bot.blockAt(pos)).filter(Boolean);
  }
  
  /**
   * Equip best available axe
   */
  async equipBestAxe() {
    const axes = ['netherite_axe', 'diamond_axe', 'iron_axe', 'stone_axe', 'wooden_axe'];
    
    for (const axeName of axes) {
      const axe = this.bot.inventory.items().find(item => item.name === axeName);
      if (axe) {
        await this.bot.equip(axe, 'hand');
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Replant saplings where trees were chopped
   */
  async replantSaplings() {
    const saplings = this.bot.inventory.items().filter(item => 
      item.name.endsWith('_sapling')
    );
    
    if (saplings.length === 0) {
      console.log(`🌱 ${this.workerId}: No saplings to plant`);
      return;
    }
    
    console.log(`🌱 ${this.workerId}: Replanting ${saplings.length} saplings...`);
    
    // Find dirt/grass blocks in zone to plant on
    const dirtBlocks = this.bot.findBlocks({
      matching: (block) => {
        const dirtTypes = ['dirt', 'grass_block', 'podzol'];
        return block && dirtTypes.includes(block.name);
      },
      maxDistance: 16,
      count: saplings.length
    });
    
    let planted = 0;
    for (const pos of dirtBlocks.slice(0, saplings.length)) {
      try {
        const block = this.bot.blockAt(pos);
        const sapling = saplings[planted];
        
        // Move near the block
        const goal = new goals.GoalNear(pos.x, pos.y, pos.z, 3);
        await this.bot.pathfinder.goto(goal);
        
        // Equip sapling
        await this.bot.equip(sapling, 'hand');
        
        // Plant on top of block
        await this.bot.placeBlock(block, new Vec3(0, 1, 0));
        
        planted++;
        await sleep(500);
        
      } catch (error) {
        // Silently continue if planting fails
      }
    }
    
    this.saplingsPlanted += planted;
    console.log(`✅ ${this.workerId}: Planted ${planted} saplings (total: ${this.saplingsPlanted})`);
  }
  
  /**
   * Deposit logs to nearest chest
   */
  async depositLogs() {
    const logs = this.bot.inventory.items().filter(item => 
      item.name.endsWith('_log')
    );
    
    if (logs.length === 0) return;
    
    // Find nearest chest (in real implementation)
    console.log(`📦 ${this.workerId}: Would deposit ${logs.length} stacks to chest`);
    
    // For now, just keep logs (in real implementation, would deposit)
  }
  
  /**
   * Stop working
   */
  stopWork() {
    console.log(`🛑 ${this.workerId} stopping work...`);
    this.isWorking = false;
  }
  
  /**
   * Get status
   */
  getStatus() {
    return {
      id: this.workerId,
      zone: this.zone?.id || 'NONE',
      logsCollected: this.logsCollected,
      saplingsPlanted: this.saplingsPlanted,
      isWorking: this.isWorking,
      position: this.bot?.entity?.position || null
    };
  }
}

module.exports = { LumberjackWorker };

// If run directly
if (require.main === module) {
  (async () => {
    const worker = new LumberjackWorker(WORKER_ID);
    await worker.initialize();
    
    // Set example zone
    worker.setZone({
      id: 'wood_zone_0_0',
      minX: 0,
      maxX: 30,
      minZ: 0,
      maxZ: 30,
      centerX: 15,
      centerZ: 15
    });
    
    // Start working
    await worker.startWork();
  })();
}
