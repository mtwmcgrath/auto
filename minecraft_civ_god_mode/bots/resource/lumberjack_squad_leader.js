/**
 * Lumberjack Squad Leader - Manages 20 lumberjack workers
 * Coordinates wood gathering operations for 100-bot army
 */

const { createBot, sleep } = require('../_common');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');

class LumberjackSquadLeader {
  constructor(botName = 'LumberjackLeader') {
    this.botName = botName;
    this.bot = null;
    this.workers = []; // Track 20 workers
    this.zones = []; // Wood gathering zones
    this.workAssignments = new Map(); // worker -> zone
    this.totalWoodGathered = 0;
    
    console.log(`🪓 ${this.botName} initializing...`);
  }
  
  /**
   * Initialize the squad leader bot
   */
  async initialize() {
    this.bot = createBot(this.botName);
    this.bot.loadPlugin(pathfinder);
    
    return new Promise((resolve) => {
      this.bot.once('spawn', async () => {
        const mcData = require('minecraft-data')(this.bot.version);
        const movements = new Movements(this.bot, mcData);
        this.bot.pathfinder.setMovements(movements);
        
        console.log(`✅ ${this.botName} spawned`);
        
        // Initialize zones for 20 workers
        this.initializeZones();
        
        resolve();
      });
    });
  }
  
  /**
   * Create 20 wood gathering zones
   */
  initializeZones() {
    console.log('🌲 Creating wood gathering zones for 20 workers...');
    
    const baseX = 0;
    const baseZ = 0;
    const zoneSize = 30; // Each zone is 30x30 blocks
    
    // Create 20 zones in a 4x5 grid
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 5; col++) {
        const zone = {
          id: `wood_zone_${row}_${col}`,
          minX: baseX + (col * zoneSize),
          maxX: baseX + ((col + 1) * zoneSize),
          minZ: baseZ + (row * zoneSize),
          maxZ: baseZ + ((row + 1) * zoneSize),
          centerX: baseX + (col * zoneSize) + zoneSize / 2,
          centerZ: baseZ + (row * zoneSize) + zoneSize / 2,
          assignedWorker: null,
          logsCollected: 0
        };
        
        this.zones.push(zone);
      }
    }
    
    console.log(`✅ Created ${this.zones.length} wood gathering zones`);
  }
  
  /**
   * Register a worker bot
   */
  registerWorker(workerId) {
    if (this.workers.length >= 20) {
      console.warn(`⚠️ Cannot register ${workerId}: Maximum 20 workers reached`);
      return false;
    }
    
    this.workers.push({
      id: workerId,
      status: 'IDLE',
      zone: null,
      logsCollected: 0
    });
    
    console.log(`✅ Registered worker ${workerId} (${this.workers.length}/20)`);
    
    // Assign zone to this worker
    this.assignWorkerToZone(workerId);
    
    return true;
  }
  
  /**
   * Assign a worker to an available zone
   */
  assignWorkerToZone(workerId) {
    const worker = this.workers.find(w => w.id === workerId);
    if (!worker) return;
    
    // Find unassigned zone
    const availableZone = this.zones.find(z => !z.assignedWorker);
    
    if (availableZone) {
      availableZone.assignedWorker = workerId;
      worker.zone = availableZone.id;
      worker.status = 'ASSIGNED';
      
      this.workAssignments.set(workerId, availableZone);
      
      console.log(`📍 Assigned ${workerId} to ${availableZone.id}`);
      console.log(`   Zone: (${availableZone.minX},${availableZone.minZ}) to (${availableZone.maxX},${availableZone.maxZ})`);
    } else {
      console.warn(`⚠️ No available zones for ${workerId}`);
    }
  }
  
  /**
   * Get zone assignment for a worker
   */
  getWorkerZone(workerId) {
    return this.workAssignments.get(workerId);
  }
  
  /**
   * Report wood collected by a worker
   */
  reportWoodCollected(workerId, amount) {
    const worker = this.workers.find(w => w.id === workerId);
    if (worker) {
      worker.logsCollected += amount;
      this.totalWoodGathered += amount;
      
      const zone = this.zones.find(z => z.id === worker.zone);
      if (zone) {
        zone.logsCollected += amount;
      }
      
      console.log(`🪵 ${workerId} collected ${amount} logs (total: ${worker.logsCollected})`);
    }
  }
  
  /**
   * Get status report
   */
  getStatusReport() {
    const activeWorkers = this.workers.filter(w => w.status === 'WORKING').length;
    
    return {
      leader: this.botName,
      totalWorkers: this.workers.length,
      activeWorkers,
      totalZones: this.zones.length,
      assignedZones: this.zones.filter(z => z.assignedWorker).length,
      totalWoodGathered: this.totalWoodGathered,
      topWorkers: this.workers
        .sort((a, b) => b.logsCollected - a.logsCollected)
        .slice(0, 5)
        .map(w => ({ id: w.id, logs: w.logsCollected }))
    };
  }
  
  /**
   * Coordinate replanting across zones
   */
  async coordinateReplanting() {
    console.log('🌱 Coordinating replanting across all zones...');
    
    for (const zone of this.zones) {
      if (zone.assignedWorker && zone.logsCollected > 100) {
        console.log(`🌱 Zone ${zone.id} needs replanting (${zone.logsCollected} logs collected)`);
        // Signal worker to replant
        // In real implementation, would send command to worker bot
      }
    }
  }
  
  /**
   * Print status summary
   */
  printStatus() {
    console.log('\n' + '='.repeat(60));
    console.log('🪓 LUMBERJACK SQUAD STATUS');
    console.log('='.repeat(60));
    console.log(`Leader: ${this.botName}`);
    console.log(`Workers: ${this.workers.length}/20`);
    console.log(`Zones: ${this.zones.filter(z => z.assignedWorker).length}/${this.zones.length} assigned`);
    console.log(`Total Wood: ${this.totalWoodGathered} logs`);
    console.log('='.repeat(60) + '\n');
  }
}

module.exports = { LumberjackSquadLeader };

// If run directly
if (require.main === module) {
  (async () => {
    const leader = new LumberjackSquadLeader();
    await leader.initialize();
    
    // Simulate registering 20 workers
    for (let i = 1; i <= 20; i++) {
      leader.registerWorker(`lumberjack_worker_${String(i).padStart(2, '0')}`);
    }
    
    leader.printStatus();
  })();
}
