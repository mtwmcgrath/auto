const fs = require('fs')
const path = require('path')
const { paths } = require('../src/config')

// ...

if (action === 'CHOP_TREE_CLUSTER') {
  const radius = Number(p.radius || 16)
  const count = Number(p.count || 10)

  // CINEMATIC MODE (ổn định + nhanh): xóa cụm cây bằng fill (nhìn như “chặt” khi quay flycam)
  // Bạn có thể refine: tìm vùng rừng trước rồi fill air theo cột.
  const cx = Number(p.x ?? 0), cy = Number(p.y ?? 70), cz = Number(p.z ?? 0)
  for (let i=0; i<count; i++){
    const dx = Math.floor((Math.random()*2-1) * radius)
    const dz = Math.floor((Math.random()*2-1) * radius)
    bot.chat(`/fill ${cx+dx} ${cy} ${cz+dz} ${cx+dx} ${cy+18} ${cz+dz} air replace oak_log`)
    bot.chat(`/fill ${cx+dx} ${cy} ${cz+dz} ${cx+dx} ${cy+18} ${cz+dz} air replace birch_log`)
    bot.chat(`/fill ${cx+dx} ${cy} ${cz+dz} ${cx+dx} ${cy+18} ${cz+dz} air replace spruce_log`)
  }
  return
}

if (action === 'BUILD_BLUEPRINT') {
  const rel = p.path
  if (!rel) return
  const bpPath = path.join(paths.dataDir, 'blueprints', rel)
  const bp = JSON.parse(fs.readFileSync(bpPath, 'utf8'))

  // blueprint format đề xuất:
  // { "origin":{"x":0,"y":70,"z":0}, "blocks":[{"x":1,"y":0,"z":2,"b":"stone_bricks"}, ...] }
  const ox = Number(bp.origin?.x ?? 0)
  const oy = Number(bp.origin?.y ?? 70)
  const oz = Number(bp.origin?.z ?? 0)

  for (const it of (bp.blocks || [])) {
    const x = ox + Number(it.x)
    const y = oy + Number(it.y)
    const z = oz + Number(it.z)
    const b = it.b || it.block || 'stone'
    bot.chat(`/setblock ${x} ${y} ${z} ${b}`)
  }
  return
}
