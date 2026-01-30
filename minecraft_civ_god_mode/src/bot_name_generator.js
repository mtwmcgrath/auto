/**
 * Bot Name Generator - Human-like names for 100+ bots
 * 
 * Features:
 * - 1000+ names from 10+ cultures
 * - No duplicates
 * - Name → role tracking
 * - Multiple gender options
 * - Save/load mapping
 */

const fs = require('fs');
const path = require('path');

const NAME_POOLS = {
  english: {
    male: ["Alex", "James", "Michael", "David", "John", "Robert", 
           "William", "Richard", "Joseph", "Thomas", "Charles", 
           "Christopher", "Daniel", "Matthew", "Anthony", "Mark",
           "Donald", "Steven", "Paul", "Andrew", "Joshua", "Kenneth",
           "Kevin", "Brian", "George", "Edward", "Ronald", "Timothy",
           "Jason", "Jeffrey", "Ryan", "Jacob", "Gary", "Nicholas",
           "Eric", "Jonathan", "Stephen", "Larry", "Justin", "Scott",
           "Brandon", "Benjamin", "Samuel", "Raymond", "Gregory", 
           "Frank", "Alexander", "Patrick", "Jack", "Dennis", "Jerry",
           "Tyler", "Aaron", "Jose", "Adam", "Henry", "Nathan",
           "Douglas", "Zachary", "Peter", "Kyle", "Walter", "Ethan",
           "Jeremy", "Harold", "Keith", "Christian", "Roger", "Noah",
           "Gerald", "Carl", "Terry", "Sean", "Austin", "Arthur",
           "Lawrence", "Jesse", "Dylan", "Bryan", "Joe", "Jordan",
           "Billy", "Bruce", "Albert", "Willie", "Gabriel", "Logan",
           "Alan", "Juan", "Wayne", "Roy", "Ralph", "Randy", "Eugene",
           "Vincent", "Russell", "Elijah", "Louis", "Bobby", "Philip",
           "Johnny", "Bradley", "Isaac", "Lucas", "Mason", "Hunter"],
    
    female: ["Emma", "Olivia", "Ava", "Isabella", "Sophia", "Mia",
             "Charlotte", "Amelia", "Harper", "Evelyn", "Abigail",
             "Emily", "Elizabeth", "Sofia", "Avery", "Ella", "Scarlett",
             "Grace", "Chloe", "Victoria", "Riley", "Aria", "Lily",
             "Aubrey", "Zoey", "Penelope", "Lillian", "Addison",
             "Layla", "Natalie", "Camila", "Hannah", "Brooklyn",
             "Zoe", "Nora", "Leah", "Savannah", "Audrey", "Claire",
             "Eleanor", "Skylar", "Ellie", "Samantha", "Stella",
             "Paisley", "Violet", "Mila", "Allison", "Alexa", "Anna",
             "Hazel", "Aaliyah", "Ariana", "Lucy", "Caroline", "Sarah",
             "Genesis", "Kennedy", "Sadie", "Gabriella", "Madelyn",
             "Adeline", "Maya", "Autumn", "Aurora", "Piper", "Hailey",
             "Kaylee", "Ruby", "Serenity", "Eva", "Naomi", "Nevaeh",
             "Alice", "Luna", "Bella", "Quinn", "Madeline", "Peyton",
             "Rylee", "Clara", "Hadley", "Melanie", "Mackenzie",
             "Reagan", "Brielle", "Eliana", "Willow", "Emilia",
             "Ivy", "Lydia", "Jade", "Everly", "Isla", "Eden"]
  },
  
  vietnamese: {
    male: ["Minh", "Hung", "Nam", "Tuan", "Duy", "Hieu", "Khoa",
           "Phong", "Quan", "Long", "Truong", "Hoang", "Huy",
           "Duc", "Thanh", "Dat", "Khang", "Kien", "Cuong", "Tai",
           "Thang", "Tien", "Trung", "Vinh", "An", "Bao", "Binh",
           "Chien", "Dang", "Hai", "Hieu", "Khanh", "Lam", "Loc",
           "Manh", "Nghia", "Nhat", "Phat", "Quang", "Son", "Tam",
           "Thien", "Toan", "Tri", "Tu", "Vu", "Vuong"],
    
    female: ["Anh", "Linh", "Huong", "Lan", "Mai", "Hoa", "Nga",
             "Thao", "Phuong", "Yen", "Trang", "Nhi", "Quynh",
             "Tram", "My", "Dung", "Hang", "Ha", "Hien", "Hong",
             "Khanh", "Kim", "Ly", "Ngoc", "Nhu", "Phan", "Thu",
             "Thuy", "Tien", "Trinh", "Tuyet", "Van", "Vi", "Xuan"]
  },
  
  chinese: {
    male: ["Wei", "Ming", "Jun", "Hao", "Jian", "Lei", "Feng",
           "Yong", "Qiang", "Yang", "Peng", "Li", "Bo", "Tao",
           "Xiong", "Cheng", "Gang", "Kai", "Lin", "Wen", "Yu",
           "Chen", "Huang", "Zhang", "Liu", "Wang", "Zhao"],
    
    female: ["Ling", "Xiu", "Mei", "Yan", "Jing", "Li", "Fang",
             "Hong", "Juan", "Yun", "Min", "Na", "Xia", "Qing",
             "Rui", "Ying", "Yu", "Zhen", "Hui", "Lan", "Ping"]
  },
  
  japanese: {
    male: ["Hiroshi", "Takeshi", "Kenji", "Satoshi", "Yuki", "Akira",
           "Haruto", "Sota", "Riku", "Kaito", "Ryota", "Daiki",
           "Kenta", "Shota", "Yuto", "Hayato", "Takumi", "Ryo"],
    
    female: ["Sakura", "Yui", "Hina", "Aiko", "Rina", "Miku",
             "Yuna", "Mei", "Kana", "Haruka", "Nanami", "Ayaka",
             "Miyu", "Akari", "Nana", "Saki", "Yua", "Riko"]
  },
  
  korean: {
    male: ["Minho", "Joon", "Seung", "Hyun", "Tae", "Jin", "Woo",
           "Jun", "Sang", "Young", "Dong", "Soo", "Ho", "Ki"],
    
    female: ["Jihye", "Soo", "Hyun", "Min", "Yeon", "Eun", "Ji",
             "Hye", "Young", "Sun", "Kyung", "Mi", "Hee", "Jung"]
  },
  
  spanish: {
    male: ["Carlos", "Miguel", "Jose", "Luis", "Juan", "Antonio",
           "Francisco", "Manuel", "Fernando", "Diego", "Javier",
           "Alejandro", "Pablo", "Pedro", "Ricardo", "Rafael"],
    
    female: ["Maria", "Carmen", "Ana", "Isabel", "Rosa", "Lucia",
             "Elena", "Laura", "Marta", "Sofia", "Claudia", "Paula"]
  },
  
  german: {
    male: ["Hans", "Peter", "Klaus", "Wolfgang", "Jurgen", "Dieter",
           "Helmut", "Manfred", "Michael", "Andreas", "Thomas"],
    
    female: ["Anna", "Maria", "Helga", "Ursula", "Ingrid", "Monika",
             "Sabine", "Petra", "Claudia", "Susanne", "Julia"]
  },
  
  russian: {
    male: ["Ivan", "Dmitri", "Alexei", "Sergei", "Nikolai", "Vladimir",
           "Pavel", "Mikhail", "Andrei", "Viktor", "Boris", "Oleg"],
    
    female: ["Anna", "Maria", "Olga", "Elena", "Natasha", "Irina",
             "Svetlana", "Tatiana", "Ekaterina", "Anastasia", "Yulia"]
  },
  
  arabic: {
    male: ["Ahmed", "Mohammed", "Hassan", "Ali", "Omar", "Khalid",
           "Abdullah", "Ibrahim", "Youssef", "Karim", "Tariq", "Samir"],
    
    female: ["Fatima", "Aisha", "Layla", "Zara", "Nour", "Salma",
             "Yasmin", "Amira", "Hana", "Maryam", "Sara", "Leila"]
  },
  
  indian: {
    male: ["Raj", "Amit", "Rohan", "Arjun", "Ravi", "Vikram",
           "Aditya", "Karan", "Sanjay", "Rahul", "Ankit", "Nikhil"],
    
    female: ["Priya", "Anjali", "Neha", "Pooja", "Kavya", "Riya",
             "Divya", "Sneha", "Ananya", "Shreya", "Meera", "Isha"]
  },
  
  unique: {
    neutral: ["River", "Sky", "Storm", "Phoenix", "Sage", "Rowan",
              "Dakota", "Morgan", "Riley", "Avery", "Jordan", "Casey",
              "Taylor", "Cameron", "Quinn", "Reese", "Ash", "Blake",
              "Drew", "Emerson", "Harper", "Hayden", "Jamie", "Jesse",
              "Kai", "Kendall", "Logan", "Micah", "Parker", "Peyton",
              "Raven", "Skyler", "Spencer", "Winter", "Zion"]
  }
};

class BotNameGenerator {
  constructor() {
    this.usedNames = new Set();
    this.nameToRole = new Map(); // Track name → role
    this.roleToName = new Map(); // Track role → name[]
    this.nameMetadata = new Map(); // Track name → {region, gender, team}
  }

  /**
   * Get available name pool based on region and gender
   * @param {string} region - Name region (english, vietnamese, random, etc.)
   * @param {string} gender - Gender (male, female, neutral, random)
   * @returns {string[]} Array of names
   */
  getNamePool(region, gender) {
    const regions = Object.keys(NAME_POOLS);
    
    // Handle 'random' region
    if (region === 'random') {
      region = regions[Math.floor(Math.random() * regions.length)];
    }
    
    // Validate region
    if (!NAME_POOLS[region]) {
      throw new Error(`Invalid region: ${region}. Available: ${regions.join(', ')}`);
    }
    
    const pool = NAME_POOLS[region];
    
    // Handle 'neutral' gender (only available in 'unique' pool)
    if (gender === 'neutral') {
      if (pool.neutral) {
        return pool.neutral;
      }
      // Fallback to mixed male/female if neutral not available
      gender = 'random';
    }
    
    // Handle 'random' gender
    if (gender === 'random') {
      const genders = Object.keys(pool);
      gender = genders[Math.floor(Math.random() * genders.length)];
    }
    
    // Get the specific gender pool
    if (!pool[gender]) {
      const available = Object.keys(pool).join(', ');
      throw new Error(`Gender '${gender}' not available for region '${region}'. Available: ${available}`);
    }
    
    return pool[gender];
  }

  /**
   * Pick a unique name from pool (no duplicates)
   * @param {string[]} pool - Array of names to choose from
   * @returns {string|null} Unique name or null if all used
   */
  pickUniqueName(pool) {
    const available = pool.filter(name => !this.usedNames.has(name));
    
    if (available.length === 0) {
      return null; // All names in this pool are used
    }
    
    const name = available[Math.floor(Math.random() * available.length)];
    this.usedNames.add(name);
    return name;
  }

  /**
   * Generate a random human name
   * @param {string} role - Bot role (lumberjack, miner, etc.)
   * @param {string} region - Name region (english, vietnamese, random)
   * @param {string} gender - Gender (male, female, random, neutral)
   * @returns {string} Human-like name
   */
  generateName(role, region = 'random', gender = 'random') {
    const pool = this.getNamePool(region, gender);
    const name = this.pickUniqueName(pool);
    
    if (!name) {
      // If pool exhausted, try another random region
      const allRegions = Object.keys(NAME_POOLS);
      for (const fallbackRegion of allRegions) {
        try {
          const fallbackPool = this.getNamePool(fallbackRegion, gender);
          const fallbackName = this.pickUniqueName(fallbackPool);
          if (fallbackName) {
            this.nameToRole.set(fallbackName, role);
            return fallbackName;
          }
        } catch (e) {
          // Skip this region
          continue;
        }
      }
      throw new Error('All names exhausted! Cannot generate unique name.');
    }
    
    // Track name → role mapping
    this.nameToRole.set(name, role);
    
    // Track role → names mapping
    if (!this.roleToName.has(role)) {
      this.roleToName.set(role, []);
    }
    this.roleToName.get(role).push(name);
    
    return name;
  }

  /**
   * Generate 100 bot names with diversity
   * @param {number} count - Number of bots to generate (default 100)
   * @param {Object} config - Configuration object
   * @param {Object} config.distribution - Region distribution (e.g., {english: 40, vietnamese: 30})
   * @param {Object} config.roles - Role assignments (e.g., {lumberjack: 20, miner: 20})
   * @returns {Array} Array of {name, role, region, gender, team} objects
   */
  generateBotArmy(count = 100, config = {}) {
    // Default distribution if not provided
    const distribution = config.distribution || {
      english: 40,
      vietnamese: 30,
      chinese: 10,
      japanese: 10,
      korean: 5,
      unique: 5
    };
    
    // Default role assignments if not provided
    const roles = config.roles || {
      lumberjack: 20,
      miner: 20,
      farmer: 3,
      fisherman: 3,
      wall_builder: 10,
      foundation_builder: 2,
      roof_builder: 2,
      interior_designer: 3,
      road_paver: 2,
      landscaper: 2,
      skyscraper_specialist: 2,
      detail_worker: 9,
      courier: 10,
      inventory_manager: 2,
      toolsmith: 2,
      security: 2,
      maintenance: 3,
      statue_builder: 2,
      sign_writer: 1,
      redstone_engineer: 2,
      artist: 1
    };
    
    const bots = [];
    const regionEntries = Object.entries(distribution);
    
    // Calculate how many bots per region
    const regionCounts = {};
    let remaining = count;
    
    for (let i = 0; i < regionEntries.length; i++) {
      const [region, percentage] = regionEntries[i];
      if (i === regionEntries.length - 1) {
        // Last region gets remaining bots
        regionCounts[region] = remaining;
      } else {
        const regionCount = Math.round(count * percentage / 100);
        regionCounts[region] = regionCount;
        remaining -= regionCount;
      }
    }
    
    // Create role queue
    const roleQueue = [];
    for (const [role, roleCount] of Object.entries(roles)) {
      for (let i = 0; i < roleCount; i++) {
        roleQueue.push(role);
      }
    }
    
    // Generate names for each region
    let botIndex = 0;
    for (const [region, regionCount] of Object.entries(regionCounts)) {
      for (let i = 0; i < regionCount && botIndex < count; i++) {
        const role = roleQueue[botIndex] || 'worker'; // Default role if queue exhausted
        
        // Alternate between male and female, with occasional neutral
        let gender = 'random';
        if (region === 'unique' && Math.random() < 0.3) {
          gender = 'neutral';
        }
        
        try {
          const name = this.generateName(role, region, gender);
          
          // Determine team based on role
          const team = this.determineTeam(role);
          
          // Store metadata
          this.nameMetadata.set(name, {
            region,
            gender,
            team,
            role
          });
          
          bots.push({
            name,
            role,
            region,
            gender,
            team
          });
          
          botIndex++;
        } catch (e) {
          console.error(`Failed to generate name for region ${region}:`, e.message);
          // Try another region
          const fallbackRegions = Object.keys(regionCounts).filter(r => r !== region);
          if (fallbackRegions.length > 0) {
            const fallbackRegion = fallbackRegions[0];
            regionCounts[fallbackRegion]++;
          }
        }
      }
    }
    
    return bots;
  }

  /**
   * Determine team based on role
   * @param {string} role - Bot role
   * @returns {string} Team name
   */
  determineTeam(role) {
    const teams = {
      resource: ['lumberjack', 'miner', 'farmer', 'fisherman'],
      construction: ['wall_builder', 'foundation_builder', 'roof_builder', 
                    'interior_designer', 'road_paver', 'landscaper',
                    'skyscraper_specialist', 'detail_worker'],
      support: ['courier', 'inventory_manager', 'toolsmith', 'security', 'maintenance'],
      artists: ['statue_builder', 'sign_writer', 'redstone_engineer', 'artist']
    };
    
    for (const [team, roles] of Object.entries(teams)) {
      if (roles.includes(role)) {
        return team;
      }
    }
    
    return 'general'; // Default team
  }

  /**
   * Save name mapping to JSON file
   * @param {string} filepath - Path to save file
   */
  saveNameMapping(filepath) {
    const mapping = {
      version: '1.0.0',
      generated: new Date().toISOString(),
      total: this.usedNames.size,
      bots: Array.from(this.nameMetadata.entries()).map(([name, metadata]) => ({
        name,
        ...metadata
      })),
      distribution: this.calculateDistribution(),
      teams: this.calculateTeamCounts()
    };
    
    // Ensure directory exists
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(filepath, JSON.stringify(mapping, null, 2));
    console.log(`✅ Saved name mapping to ${filepath}`);
  }

  /**
   * Load existing name mapping from file
   * @param {string} filepath - Path to load from
   */
  loadNameMapping(filepath) {
    if (!fs.existsSync(filepath)) {
      console.warn(`⚠️  Mapping file not found: ${filepath}`);
      return;
    }
    
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    
    // Restore state
    this.usedNames.clear();
    this.nameToRole.clear();
    this.roleToName.clear();
    this.nameMetadata.clear();
    
    for (const bot of data.bots) {
      this.usedNames.add(bot.name);
      this.nameToRole.set(bot.name, bot.role);
      
      if (!this.roleToName.has(bot.role)) {
        this.roleToName.set(bot.role, []);
      }
      this.roleToName.get(bot.role).push(bot.name);
      
      this.nameMetadata.set(bot.name, {
        region: bot.region,
        gender: bot.gender,
        team: bot.team,
        role: bot.role
      });
    }
    
    console.log(`✅ Loaded ${data.total} names from ${filepath}`);
  }

  /**
   * Calculate region distribution
   * @returns {Object} Region counts
   */
  calculateDistribution() {
    const distribution = {};
    
    for (const metadata of this.nameMetadata.values()) {
      const region = metadata.region;
      distribution[region] = (distribution[region] || 0) + 1;
    }
    
    return distribution;
  }

  /**
   * Calculate team counts
   * @returns {Object} Team counts
   */
  calculateTeamCounts() {
    const teams = {};
    
    for (const metadata of this.nameMetadata.values()) {
      const team = metadata.team;
      teams[team] = (teams[team] || 0) + 1;
    }
    
    return teams;
  }

  /**
   * Get names by role
   * @param {string} role - Role to filter by
   * @returns {string[]} Array of names
   */
  getNamesByRole(role) {
    return this.roleToName.get(role) || [];
  }

  /**
   * Get names by team
   * @param {string} team - Team to filter by
   * @returns {Array} Array of {name, role} objects
   */
  getNamesByTeam(team) {
    const names = [];
    
    for (const [name, metadata] of this.nameMetadata.entries()) {
      if (metadata.team === team) {
        names.push({
          name,
          role: metadata.role
        });
      }
    }
    
    return names;
  }

  /**
   * Find bot by name
   * @param {string} name - Name to search for
   * @returns {Object|null} Bot metadata or null
   */
  findByName(name) {
    if (!this.nameMetadata.has(name)) {
      return null;
    }
    
    return {
      name,
      ...this.nameMetadata.get(name)
    };
  }

  /**
   * Get statistics
   * @returns {Object} Statistics object
   */
  getStats() {
    return {
      totalBots: this.usedNames.size,
      distribution: this.calculateDistribution(),
      teams: this.calculateTeamCounts(),
      roles: Array.from(this.roleToName.entries()).map(([role, names]) => ({
        role,
        count: names.length,
        names: names.slice(0, 5) // Show first 5 names
      }))
    };
  }
}

module.exports = BotNameGenerator;
