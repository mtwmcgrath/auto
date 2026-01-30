/**
 * Building Utilities for 9woke City Builder
 * Các hàm tiện ích cho xây dựng và chặt cây tự động
 */

const { Vec3 } = require('vec3')

/**
 * Tìm cây gần nhất trong bán kính
 * @param {Bot} bot - Mineflayer bot instance
 * @param {number} range - Bán kính tìm kiếm (mặc định 50)
 * @returns {Block|null} Block của cây gần nhất hoặc null
 */
function findNearestTree(bot, range = 50) {
  const mcData = require('minecraft-data')(bot.version)
  
  // Tìm tất cả các loại gỗ (log)
  const logTypes = Object.values(mcData.blocksByName)
    .filter(b => b.name.endsWith('_log'))
    .map(b => b.id)
  
  if (!logTypes.length) return null
  
  // Tìm block log gần nhất
  const logBlock = bot.findBlock({
    matching: (block) => block && logTypes.includes(block.type),
    maxDistance: range
  })
  
  return logBlock
}

/**
 * Chặt hoàn toàn một cây từ dưới lên
 * @param {Bot} bot - Mineflayer bot instance
 * @param {Block} treeBlock - Block gốc cây
 * @returns {Promise<number>} Số lượng block gỗ đã chặt
 */
async function chopTreeComplete(bot, treeBlock) {
  if (!treeBlock) return 0
  
  const mcData = require('minecraft-data')(bot.version)
  const logTypes = Object.values(mcData.blocksByName)
    .filter(b => b.name.endsWith('_log'))
    .map(b => b.id)
  
  let woodCount = 0
  const basePos = treeBlock.position
  
  // Tìm tất cả các block log của cây (trong phạm vi hợp lý)
  const treeBlocks = []
  for (let dy = 0; dy < 20; dy++) {
    for (let dx = -2; dx <= 2; dx++) {
      for (let dz = -2; dz <= 2; dz++) {
        const pos = basePos.offset(dx, dy, dz)
        const block = bot.blockAt(pos)
        if (block && logTypes.includes(block.type)) {
          treeBlocks.push(block)
        }
      }
    }
  }
  
  // Chặt tất cả các block tìm được
  if (treeBlocks.length > 0) {
    try {
      await bot.collectBlock.collect(treeBlocks, { ignoreNoPath: true })
      woodCount = treeBlocks.length
    } catch (err) {
      console.log('[BUILDING_UTILS] Error chopping tree:', err.message)
    }
  }
  
  return woodCount
}

/**
 * Đặt blocks theo một pattern/blueprint
 * @param {Bot} bot - Mineflayer bot instance
 * @param {Array} pattern - Mảng các vị trí và loại block [{x, y, z, blockName}]
 * @param {Vec3} startPos - Vị trí bắt đầu
 * @param {Function} progressCallback - Callback để báo cáo tiến độ (optional)
 * @returns {Promise<number>} Số lượng blocks đã đặt
 */
async function placeBlockPattern(bot, pattern, startPos, progressCallback = null) {
  let placedCount = 0
  const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
  
  for (let i = 0; i < pattern.length; i++) {
    const { x, y, z, blockName } = pattern[i]
    const targetPos = new Vec3(
      startPos.x + x,
      startPos.y + y,
      startPos.z + z
    )
    
    try {
      // Kiểm tra có block trong inventory không
      const item = bot.inventory.items().find(item => item.name === blockName)
      if (!item) {
        console.log(`[BUILDING_UTILS] Missing block: ${blockName}`)
        continue
      }
      
      // Di chuyển gần vị trí đặt block
      await bot.pathfinder.goto(new goals.GoalNear(targetPos.x, targetPos.y, targetPos.z, 4))
      
      // Tìm block tham chiếu để đặt block lên trên
      const referenceBlock = bot.blockAt(targetPos.offset(0, -1, 0))
      if (!referenceBlock || referenceBlock.name === 'air') {
        // Thử tìm block bên cạnh
        const sides = [
          targetPos.offset(1, 0, 0),
          targetPos.offset(-1, 0, 0),
          targetPos.offset(0, 0, 1),
          targetPos.offset(0, 0, -1)
        ]
        let foundRef = null
        for (const sidePos of sides) {
          const sideBlock = bot.blockAt(sidePos)
          if (sideBlock && sideBlock.name !== 'air') {
            foundRef = sideBlock
            break
          }
        }
        if (!foundRef) continue
      }
      
      await bot.equip(item, 'hand')
      await bot.placeBlock(referenceBlock || bot.blockAt(targetPos.offset(0, -1, 0)), new Vec3(0, 1, 0))
      
      placedCount++
      
      if (progressCallback) {
        progressCallback(i + 1, pattern.length)
      }
      
      // Delay nhỏ để tránh spam
      await new Promise(resolve => setTimeout(resolve, 100))
      
    } catch (err) {
      console.log(`[BUILDING_UTILS] Error placing block at ${targetPos}:`, err.message)
    }
  }
  
  return placedCount
}

/**
 * Tính toán vật liệu cần thiết cho một blueprint
 * @param {Object} blueprint - Blueprint chứa pattern và thông tin xây dựng
 * @returns {Object} Object với key là tên block, value là số lượng cần
 */
function calculateBuildingMaterials(blueprint) {
  const materials = {}
  
  if (blueprint.pattern && Array.isArray(blueprint.pattern)) {
    for (const block of blueprint.pattern) {
      const blockName = block.blockName || block.name
      if (blockName) {
        materials[blockName] = (materials[blockName] || 0) + 1
      }
    }
  }
  
  return materials
}

/**
 * Tạo blueprint cho một loại building
 * @param {string} type - Loại building ('house', 'road', 'plaza', 'skyscraper', 'farm', 'shop')
 * @param {Object} size - Kích thước {width, depth, height}
 * @param {string} material - Vật liệu xây dựng mặc định (e.g., 'oak_planks')
 * @returns {Object} Blueprint object với pattern
 */
function createBuildingBlueprint(type, size = {}, material = 'oak_planks') {
  const { width = 7, depth = 7, height = 4 } = size
  const pattern = []
  
  switch (type) {
    case 'house':
      // Sàn nhà
      for (let x = 0; x < width; x++) {
        for (let z = 0; z < depth; z++) {
          pattern.push({ x, y: 0, z, blockName: material })
        }
      }
      
      // Tường
      for (let y = 1; y <= height; y++) {
        // Tường trước và sau
        for (let x = 0; x < width; x++) {
          pattern.push({ x, y, z: 0, blockName: material })
          pattern.push({ x, y, z: depth - 1, blockName: material })
        }
        // Tường trái và phải
        for (let z = 1; z < depth - 1; z++) {
          pattern.push({ x: 0, y, z, blockName: material })
          pattern.push({ x: width - 1, y, z, blockName: material })
        }
      }
      
      // Mái nhà (đơn giản)
      for (let x = 0; x < width; x++) {
        for (let z = 0; z < depth; z++) {
          pattern.push({ x, y: height + 1, z, blockName: material })
        }
      }
      break
      
    case 'road':
      // Đường đơn giản
      const roadMaterial = 'stone'
      for (let x = 0; x < width; x++) {
        for (let z = 0; z < depth; z++) {
          pattern.push({ x, y: 0, z, blockName: roadMaterial })
        }
      }
      break
      
    case 'plaza':
      // Quảng trường với pattern
      const plazaMaterial = 'stone_bricks'
      for (let x = 0; x < width; x++) {
        for (let z = 0; z < depth; z++) {
          // Tạo pattern checker
          const mat = (x + z) % 2 === 0 ? plazaMaterial : 'polished_andesite'
          pattern.push({ x, y: 0, z, blockName: mat })
        }
      }
      break
      
    case 'skyscraper':
      // Tòa nhà cao tầng (đơn giản hóa)
      const buildingMaterial = 'stone_bricks'
      const glassPane = 'glass_pane'
      
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          for (let z = 0; z < depth; z++) {
            // Sàn
            if (y % 4 === 0) {
              pattern.push({ x, y, z, blockName: buildingMaterial })
            }
            // Tường ngoài
            if (x === 0 || x === width - 1 || z === 0 || z === depth - 1) {
              if (y % 4 !== 0) {
                const mat = (x + z + y) % 3 === 0 ? glassPane : buildingMaterial
                pattern.push({ x, y, z, blockName: mat })
              }
            }
          }
        }
      }
      break
      
    case 'farm':
      // Trang trại đơn giản
      for (let x = 0; x < width; x++) {
        for (let z = 0; z < depth; z++) {
          pattern.push({ x, y: 0, z, blockName: 'farmland' })
        }
      }
      break
      
    case 'shop':
      // Cửa hàng nhỏ
      for (let x = 0; x < width; x++) {
        for (let z = 0; z < depth; z++) {
          pattern.push({ x, y: 0, z, blockName: material })
        }
      }
      // Tường
      for (let y = 1; y <= 3; y++) {
        for (let x = 0; x < width; x++) {
          pattern.push({ x, y, z: 0, blockName: material })
          pattern.push({ x, y, z: depth - 1, blockName: material })
        }
        for (let z = 1; z < depth - 1; z++) {
          pattern.push({ x: 0, y, z, blockName: material })
          pattern.push({ x: width - 1, y, z, blockName: material })
        }
      }
      break
      
    default:
      console.log('[BUILDING_UTILS] Unknown building type:', type)
  }
  
  return {
    type,
    size: { width, depth, height },
    material,
    pattern,
    blockCount: pattern.length
  }
}

module.exports = {
  findNearestTree,
  chopTreeComplete,
  placeBlockPattern,
  calculateBuildingMaterials,
  createBuildingBlueprint
}
