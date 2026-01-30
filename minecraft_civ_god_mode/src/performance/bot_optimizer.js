/**
 * BotOptimizer100 - Performance optimization for 100-bot army
 * 
 * Key features:
 * - Zone-based bot distribution (10x10 grid)
 * - Collision avoidance system
 * - Dynamic load balancing
 * - CPU/RAM monitoring
 * - Path reservation system
 */

const os = require('os');

class BotOptimizer100 {
  constructor(config = {}) {
    this.maxBots = config.maxBots || 100;
    this.zoneGridWidth = config.zoneGridWidth || 10;
    this.zoneGridHeight = config.zoneGridHeight || 10;
    this.maxBotsPerZone = config.maxBotsPerZone || 5;
    
    // Create zone grid
    this.zones = this.createZones(this.zoneGridWidth, this.zoneGridHeight);
    
    // Bot tracking
    this.activeBots = new Map(); // botId -> botData
    this.zoneAssignments = new Map(); // zoneId -> [botIds]
    
    // Path reservation system
    this.pathReservations = new Map(); // position -> botId
    
    // Performance metrics
    this.metrics = {
      cpuUsage: 0,
      memoryUsage: 0,
      activeBotsCount: 0,
      avgResponseTime: 0,
      collisionCount: 0
    };
    
    // Start monitoring
    this.startPerformanceMonitoring();
  }
  
  /**
   * Create a grid of zones for bot distribution
   */
  createZones(width, height) {
    const zones = [];
    const zoneSize = 50; // Each zone is 50x50 blocks
    
    for (let x = 0; x < width; x++) {
      for (let z = 0; z < height; z++) {
        zones.push({
          id: `zone_${x}_${z}`,
          x: x,
          z: z,
          minX: x * zoneSize,
          maxX: (x + 1) * zoneSize,
          minZ: z * zoneSize,
          maxZ: (z + 1) * zoneSize,
          centerX: x * zoneSize + zoneSize / 2,
          centerZ: z * zoneSize + zoneSize / 2,
          assignedBots: [],
          type: this.determineZoneType(x, z, width, height)
        });
      }
    }
    
    return zones;
  }
  
  /**
   * Determine zone type based on position
   * - Outer zones: Resource gathering
   * - Middle zones: Construction
   * - Inner zones: Central construction
   */
  determineZoneType(x, z, width, height) {
    const centerX = width / 2;
    const centerZ = height / 2;
    const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(z - centerZ, 2));
    
    if (distance < 2) return 'INNER_CONSTRUCTION';
    if (distance < 4) return 'MIDDLE_CONSTRUCTION';
    return 'OUTER_RESOURCE';
  }
  
  /**
   * Assign a bot to an optimal zone based on bot type
   */
  assignBotToZone(botId, botType, preferredLocation = null) {
    let targetZone = null;
    
    if (preferredLocation) {
      // Find zone containing the preferred location
      targetZone = this.zones.find(zone => 
        preferredLocation.x >= zone.minX && preferredLocation.x < zone.maxX &&
        preferredLocation.z >= zone.minZ && preferredLocation.z < zone.maxZ
      );
    }
    
    if (!targetZone) {
      // Find best zone based on bot type
      const preferredType = this.getBotZonePreference(botType);
      const availableZones = this.zones.filter(zone => 
        zone.type === preferredType && 
        zone.assignedBots.length < this.maxBotsPerZone
      );
      
      if (availableZones.length > 0) {
        // Pick zone with fewest bots
        targetZone = availableZones.reduce((min, zone) => 
          zone.assignedBots.length < min.assignedBots.length ? zone : min
        );
      } else {
        // Fallback: any zone with space
        targetZone = this.zones.find(zone => 
          zone.assignedBots.length < this.maxBotsPerZone
        );
      }
    }
    
    if (targetZone) {
      targetZone.assignedBots.push(botId);
      
      if (!this.zoneAssignments.has(targetZone.id)) {
        this.zoneAssignments.set(targetZone.id, []);
      }
      this.zoneAssignments.get(targetZone.id).push(botId);
      
      this.activeBots.set(botId, {
        id: botId,
        type: botType,
        zoneId: targetZone.id,
        zone: targetZone,
        status: 'ACTIVE'
      });
      
      return targetZone;
    }
    
    throw new Error(`Cannot assign bot ${botId}: No available zones`);
  }
  
  /**
   * Get preferred zone type for bot type
   */
  getBotZonePreference(botType) {
    const upperType = botType.toUpperCase();
    
    if (upperType.includes('LUMBERJACK') || upperType.includes('MINER') || 
        upperType.includes('FARMER') || upperType.includes('FISHER')) {
      return 'OUTER_RESOURCE';
    }
    
    if (upperType.includes('FOUNDATION') || upperType.includes('WALL') || 
        upperType.includes('ROOF') || upperType.includes('SKYSCRAPER')) {
      return 'INNER_CONSTRUCTION';
    }
    
    return 'MIDDLE_CONSTRUCTION';
  }
  
  /**
   * Reserve a path for a bot to prevent collisions
   */
  reservePath(botId, positions) {
    const reservations = [];
    
    for (const pos of positions) {
      const key = `${Math.floor(pos.x)},${Math.floor(pos.y)},${Math.floor(pos.z)}`;
      
      // Check if already reserved by another bot
      if (this.pathReservations.has(key) && this.pathReservations.get(key) !== botId) {
        // Collision detected - clear reservations and return false
        this.clearPathReservations(botId, reservations);
        return false;
      }
      
      this.pathReservations.set(key, botId);
      reservations.push(key);
    }
    
    return reservations;
  }
  
  /**
   * Clear path reservations for a bot
   */
  clearPathReservations(botId, reservations = null) {
    if (reservations) {
      for (const key of reservations) {
        if (this.pathReservations.get(key) === botId) {
          this.pathReservations.delete(key);
        }
      }
    } else {
      // Clear all reservations for this bot
      for (const [key, id] of this.pathReservations.entries()) {
        if (id === botId) {
          this.pathReservations.delete(key);
        }
      }
    }
  }
  
  /**
   * Check if a position is safe (no collisions)
   */
  isPositionSafe(position, excludeBotId = null) {
    const key = `${Math.floor(position.x)},${Math.floor(position.y)},${Math.floor(position.z)}`;
    
    if (!this.pathReservations.has(key)) return true;
    
    const reservingBot = this.pathReservations.get(key);
    return reservingBot === excludeBotId;
  }
  
  /**
   * Get nearby bots to avoid collisions
   */
  getNearbyBots(position, radius = 5) {
    const nearby = [];
    
    for (const [botId, botData] of this.activeBots.entries()) {
      if (botData.currentPosition) {
        const distance = Math.sqrt(
          Math.pow(position.x - botData.currentPosition.x, 2) +
          Math.pow(position.y - botData.currentPosition.y, 2) +
          Math.pow(position.z - botData.currentPosition.z, 2)
        );
        
        if (distance <= radius) {
          nearby.push({ botId, botData, distance });
        }
      }
    }
    
    return nearby.sort((a, b) => a.distance - b.distance);
  }
  
  /**
   * Monitor CPU and RAM usage
   */
  startPerformanceMonitoring() {
    setInterval(() => {
      this.updateMetrics();
    }, 5000); // Update every 5 seconds
  }
  
  /**
   * Update performance metrics
   */
  updateMetrics() {
    // CPU usage
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;
    
    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });
    
    const cpuUsage = 100 - (100 * totalIdle / totalTick);
    
    // Memory usage
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memoryUsage = ((totalMem - freeMem) / totalMem) * 100;
    
    this.metrics.cpuUsage = cpuUsage;
    this.metrics.memoryUsage = memoryUsage;
    this.metrics.activeBotsCount = this.activeBots.size;
    
    // Auto-adjust if performance is degrading
    if (cpuUsage > 95 && this.activeBots.size > 80) {
      console.warn(`⚠️ High CPU usage (${cpuUsage.toFixed(1)}%). Consider reducing active bots.`);
    }
    
    if (memoryUsage > 90) {
      console.warn(`⚠️ High memory usage (${memoryUsage.toFixed(1)}%). System may become unstable.`);
    }
  }
  
  /**
   * Get current performance metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      timestamp: Date.now(),
      zones: this.zones.map(z => ({
        id: z.id,
        type: z.type,
        botCount: z.assignedBots.length,
        utilization: (z.assignedBots.length / this.maxBotsPerZone) * 100
      }))
    };
  }
  
  /**
   * Suggest optimal bot count based on current performance
   */
  suggestBotCount() {
    const { cpuUsage, memoryUsage } = this.metrics;
    
    if (cpuUsage > 90 || memoryUsage > 85) {
      return Math.max(80, this.activeBots.size - 10);
    }
    
    if (cpuUsage < 60 && memoryUsage < 70) {
      return Math.min(120, this.activeBots.size + 10);
    }
    
    return this.activeBots.size;
  }
  
  /**
   * Remove a bot from tracking
   */
  removeBot(botId) {
    const botData = this.activeBots.get(botId);
    
    if (botData && botData.zoneId) {
      const zone = this.zones.find(z => z.id === botData.zoneId);
      if (zone) {
        zone.assignedBots = zone.assignedBots.filter(id => id !== botId);
      }
      
      const zoneList = this.zoneAssignments.get(botData.zoneId);
      if (zoneList) {
        this.zoneAssignments.set(
          botData.zoneId, 
          zoneList.filter(id => id !== botId)
        );
      }
    }
    
    this.clearPathReservations(botId);
    this.activeBots.delete(botId);
  }
  
  /**
   * Get status report
   */
  getStatusReport() {
    const report = {
      totalBots: this.activeBots.size,
      maxBots: this.maxBots,
      utilizationPercent: (this.activeBots.size / this.maxBots) * 100,
      zones: {
        total: this.zones.length,
        byType: {}
      },
      performance: this.metrics,
      recommendations: []
    };
    
    // Count bots by zone type
    for (const zone of this.zones) {
      if (!report.zones.byType[zone.type]) {
        report.zones.byType[zone.type] = { zones: 0, bots: 0 };
      }
      report.zones.byType[zone.type].zones++;
      report.zones.byType[zone.type].bots += zone.assignedBots.length;
    }
    
    // Generate recommendations
    const suggestedBotCount = this.suggestBotCount();
    if (suggestedBotCount !== this.activeBots.size) {
      report.recommendations.push(
        `Consider adjusting bot count to ${suggestedBotCount} for optimal performance`
      );
    }
    
    return report;
  }
}

module.exports = { BotOptimizer100 };
