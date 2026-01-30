/**
 * Wall Builder Bot #01
 * One of 10 wall builders in the Construction Team
 * Specializes in building walls quickly and efficiently
 */

require('dotenv').config();
const { createBot, sleep } = require('../_common');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const { Vec3 } = require('vec3');

const WORKER_ID = 'wall_builder_01';

class WallBuilder {
  constructor(workerId = WORKER_ID) {
    this.workerId = workerId;
    this.bot = null;
    this.mcData = null;
    this.currentTask = null;
    this.blocksPlaced = 0;
    this.isWorking = false;
    
    console.log(`🧱 ${this.workerId} initializing...`);
  }
  
  /**
   * Initialize the builder bot
   */
  async initialize() {
    this.bot = createBot(this.workerId);
    this.bot.loadPlugin(pathfinder);
    
    return new Promise((resolve) => {
      this.bot.once('spawn', async () => {
        this.mcData = require('minecraft-data')(this.bot.version);
        const movements = new Movements(this.bot, this.mcData);
        this.bot.pathfinder.setMovements(movements);
        
        console.log(`✅ ${this.workerId} spawned and ready to build walls!`);
        resolve();
      });
    });
  }
  
  /**
   * Build a wall segment
   * @param {Object} task - Wall building task
   * @param {number} task.startX - Start X coordinate
   * @param {number} task.startY - Start Y coordinate
   * @param {number} task.startZ - Start Z coordinate
   * @param {number} task.endX - End X coordinate
   * @param {number} task.endZ - End Z coordinate
   * @param {number} task.height - Wall height
   * @param {string} task.material - Block type to use
   */
  async buildWall(task) {
    this.currentTask = task;
    this.isWorking = true;
    
    const { startX, startY, startZ, endX, endZ, height, material } = task;
    
    console.log(`🧱 ${this.workerId}: Building wall from (${startX},${startY},${startZ}) to (${endX},${endZ}), height=${height}`);
    
    try {
      // Determine if wall is along X or Z axis
      const isAlongX = Math.abs(endX - startX) > Math.abs(endZ - startZ);
      
      if (isAlongX) {
        // Build along X axis
        const minX = Math.min(startX, endX);
        const maxX = Math.max(startX, endX);
        
        for (let y = startY; y < startY + height; y++) {
          for (let x = minX; x <= maxX; x++) {
            await this.placeBlockAt(x, y, startZ, material);
            await sleep(50); // Slight delay between blocks
          }
        }
      } else {
        // Build along Z axis
        const minZ = Math.min(startZ, endZ);
        const maxZ = Math.max(startZ, endZ);
        
        for (let y = startY; y < startY + height; y++) {
          for (let z = minZ; z <= maxZ; z++) {
            await this.placeBlockAt(startX, y, z, material);
            await sleep(50);
          }
        }
      }
      
      console.log(`✅ ${this.workerId}: Wall complete! Placed ${this.blocksPlaced} blocks total`);
      
    } catch (error) {
      console.error(`❌ ${this.workerId}: Error building wall:`, error.message);
    } finally {
      this.isWorking = false;
      this.currentTask = null;
    }
  }
  
  /**
   * Build a rectangular wall structure
   */
  async buildRectangularWalls(x, y, z, width, depth, height, material = 'stone_bricks') {
    console.log(`🧱 ${this.workerId}: Building rectangular walls ${width}x${depth}x${height}`);
    
    this.isWorking = true;
    
    try {
      // North wall (along X)
      await this.buildWall({
        startX: x,
        startY: y,
        startZ: z,
        endX: x + width - 1,
        endZ: z,
        height,
        material
      });
      
      // South wall (along X)
      await this.buildWall({
        startX: x,
        startY: y,
        startZ: z + depth - 1,
        endX: x + width - 1,
        endZ: z + depth - 1,
        height,
        material
      });
      
      // West wall (along Z)
      await this.buildWall({
        startX: x,
        startY: y,
        startZ: z,
        endX: x,
        endZ: z + depth - 1,
        height,
        material
      });
      
      // East wall (along Z)
      await this.buildWall({
        startX: x + width - 1,
        startY: y,
        startZ: z,
        endX: x + width - 1,
        endZ: z + depth - 1,
        height,
        material
      });
      
      console.log(`✅ ${this.workerId}: Rectangular structure complete!`);
      
    } catch (error) {
      console.error(`❌ ${this.workerId}: Error building structure:`, error.message);
    } finally {
      this.isWorking = false;
    }
  }
  
  /**
   * Place a block at specific coordinates
   */
  async placeBlockAt(x, y, z, blockName) {
    try {
      // Check if block already exists
      const existingBlock = this.bot.blockAt(new Vec3(x, y, z));
      if (existingBlock && existingBlock.name !== 'air') {
        return; // Skip if block already there
      }
      
      // Find material in inventory
      const item = this.bot.inventory.items().find(i => i.name === blockName);
      if (!item) {
        console.warn(`⚠️ ${this.workerId}: No ${blockName} in inventory`);
        return;
      }
      
      // Move near the position
      const goal = new goals.GoalNear(x, y, z, 4);
      await this.bot.pathfinder.goto(goal);
      
      // Find reference block (usually one below)
      const referenceBlock = this.bot.blockAt(new Vec3(x, y - 1, z));
      if (!referenceBlock) {
        console.warn(`⚠️ ${this.workerId}: No reference block at (${x},${y-1},${z})`);
        return;
      }
      
      // Equip and place
      await this.bot.equip(item, 'hand');
      await this.bot.placeBlock(referenceBlock, new Vec3(0, 1, 0));
      
      this.blocksPlaced++;
      
    } catch (error) {
      // Silently continue on placement errors
    }
  }
  
  /**
   * Add windows to a wall section
   */
  async addWindows(startX, startY, startZ, endX, endZ, windowInterval = 3) {
    console.log(`🪟 ${this.workerId}: Adding windows...`);
    
    const isAlongX = Math.abs(endX - startX) > Math.abs(endZ - startZ);
    
    if (isAlongX) {
      const minX = Math.min(startX, endX);
      const maxX = Math.max(startX, endX);
      
      for (let x = minX; x <= maxX; x += windowInterval) {
        // Place glass_pane at window height
        await this.placeBlockAt(x, startY + 2, startZ, 'glass_pane');
      }
    } else {
      const minZ = Math.min(startZ, endZ);
      const maxZ = Math.max(startZ, endZ);
      
      for (let z = minZ; z <= maxZ; z += windowInterval) {
        await this.placeBlockAt(startX, startY + 2, z, 'glass_pane');
      }
    }
    
    console.log(`✅ ${this.workerId}: Windows added`);
  }
  
  /**
   * Get status
   */
  getStatus() {
    return {
      id: this.workerId,
      blocksPlaced: this.blocksPlaced,
      isWorking: this.isWorking,
      currentTask: this.currentTask,
      position: this.bot?.entity?.position || null
    };
  }
}

module.exports = { WallBuilder };

// If run directly
if (require.main === module) {
  (async () => {
    const builder = new WallBuilder(WORKER_ID);
    await builder.initialize();
    
    // Example: Build a simple rectangular structure
    await builder.buildRectangularWalls(
      100, 70, 100,  // x, y, z
      10, 10, 4,     // width, depth, height
      'stone_bricks'
    );
    
    console.log('Status:', builder.getStatus());
  })();
}
