# Fantasy Kingdom Example

## Story

A majestic white castle stands at the center of the kingdom, with four tall towers reaching towards the sky. Each tower is 30 blocks high, topped with red cone-shaped roofs. The castle walls are made of white concrete and stone bricks, with large wooden doors guarding the entrance.

Around the castle, a medieval village spreads out with cobblestone roads connecting wooden houses. The village includes:
- A blacksmith shop with a smoking chimney
- A marketplace with colorful stalls
- A church with a bell tower
- Farmlands with wheat and carrots
- A stone bridge over a river

The entire kingdom is surrounded by a protective stone wall with watchtowers at each corner.

## Vietnamese Version

Một lâu đài trắng hùng vĩ đứng ở trung tâm vương quốc, với bốn tòa tháp cao vút lên trời. Mỗi tháp cao 30 blocks, đỉnh là mái vòm đỏ hình nón. Tường thành làm từ bê tông trắng và gạch đá, với cổng gỗ lớn bảo vệ lối vào.

Xung quanh lâu đài, một ngôi làng thời trung cổ trải dài với những con đường đá cuội nối các ngôi nhà gỗ. Ngôi làng bao gồm:
- Tiệm rèn với ống khói đang bốc khói
- Chợ với các gian hàng đầy màu sắc
- Nhà thờ với tháp chuông
- Đất nông trại trồng lúa mì và cà rốt
- Cây cầu đá bắc qua con sông

Toàn bộ vương quốc được bao quanh bởi một bức tường đá bảo vệ với các tháp canh ở mỗi góc.

## Expected Blueprint

```json
{
  "buildings": [
    {
      "type": "castle",
      "count": 1,
      "priority": 4,
      "dimensions": { "width": 60, "length": 60, "height": 40 }
    },
    {
      "type": "tower",
      "count": 4,
      "priority": 3,
      "dimensions": { "width": 10, "length": 10, "height": 30 }
    },
    {
      "type": "house",
      "count": 15,
      "priority": 2,
      "dimensions": { "width": 8, "length": 8, "height": 6 }
    },
    {
      "type": "wall",
      "count": 1,
      "priority": 1,
      "dimensions": { "perimeter": 200, "height": 10 }
    },
    {
      "type": "bridge",
      "count": 1,
      "priority": 5,
      "dimensions": { "width": 6, "length": 20, "height": 5 }
    }
  ],
  "materials": {
    "primary": "white_concrete",
    "secondary": "stone_bricks",
    "accent": "oak_planks",
    "roof": "red_terracotta"
  },
  "theme": "medieval",
  "estimated_blocks": 15000,
  "estimated_time": "45 minutes"
}
```

## Bot Deployment Plan

### Phase 1: Foundation & Walls (0-10 minutes)
- Foundation Builder: Castle base
- Wall Builders 01-05: Protective walls

### Phase 2: Main Structures (10-25 minutes)
- Construction team: Castle main building
- Wall Builders: 4 towers
- Road Paver: Cobblestone roads

### Phase 3: Village Buildings (25-35 minutes)
- Wall Builders 01-05: Houses (parallel)
- Detail Workers: Blacksmith, marketplace, church

### Phase 4: Details & Landscaping (35-45 minutes)
- Interior Designer: Furnish buildings
- Landscaper: Farmlands, gardens, river
- Artists: Signs, decorations, statues

## Camera Shot List

### Shot 1: Opening Establishing (10s)
- Camera: Aerial Drone (01)
- Position: High above, 200 blocks
- Movement: Slow orbit around entire kingdom
- Hook: "I hired 50 bots to build a fantasy kingdom..."

### Shot 2: Construction Timelapse (60s)
- Camera: Timelapse Cam (03)
- Position: Fixed at city center
- Speed: 10x
- Shows: Entire build from start to finish

### Shot 3: Worker Bots Montage (20s)
- Camera: Tracking Cam (02)
- Follows: Multiple worker bots
- Shows: Bots placing blocks, chopping trees, crafting

### Shot 4: Castle Close-ups (15s)
- Camera: Close-up Specialist (04)
- Focus: Tower construction, window details, door placement

### Shot 5: Aerial Reveal (20s)
- Camera: Aerial Drone (01)
- Movement: 360° panorama at sunset
- Hook: "You won't believe what we built..."

### Shot 6: Final Reveal (15s)
- Camera: Crane Cam (06)
- Movement: Start low, crane up to reveal full kingdom
- Music: Epic drop
- Text: "From nothing to THIS in 45 minutes"

## Expected Outputs

### TikTok Version (60s)
```
0:00-0:03 - Hook: Best aerial shot + "50 bots built a kingdom"
0:03-0:10 - Setup: Empty land, explain goal
0:10-0:45 - Montage: Fast-cut construction scenes
0:45-0:55 - Reveal: Final kingdom aerial view
0:55-1:00 - CTA: "Like for part 2!"
```

### YouTube Shorts (60s)
- Same as TikTok but higher quality (60fps)

### YouTube Full (10 minutes)
```
0:00-0:30 - Intro: Story, goal, bot army introduction
0:30-2:00 - Chapter 1: Foundation & walls
2:00-5:00 - Chapter 2: Castle construction
5:00-8:00 - Chapter 3: Village buildings
8:00-9:30 - Chapter 4: Details & landscaping
9:30-10:00 - Finale: Full kingdom tour
```

## Thumbnail Options

### Option 1
- Frame: Aerial view of completed kingdom
- Text: "50 BOTS BUILD KINGDOM"
- Style: Yellow text, black outline
- Effect: +20% saturation

### Option 2
- Frame: Bots working on castle
- Text: "ARMY OF BOTS"
- Arrow: Pointing to bot cluster
- Effect: Red circle highlight

### Option 3
- Frame: Before/after split screen
- Text: "45 MINUTES"
- Style: Bold, all caps
- Effect: Dramatic contrast

## Run Command

```bash
# Run this example
npm run workflow story "$(cat examples/fantasy_kingdom/story.txt)"

# Or use the file directly
node src/main_workflow.js story "A majestic white castle with four tall towers..."
```

## Expected Results

- ✅ 1 Castle (60x60x40 blocks)
- ✅ 4 Towers (10x10x30 blocks each)
- ✅ 15 Village houses
- ✅ 1 Protective wall (perimeter)
- ✅ 1 Stone bridge
- ✅ Roads connecting buildings
- ✅ Farmlands and decorations
- ✅ ~15,000 blocks total
- ✅ 3 viral video versions
- ✅ 3 thumbnail options
- ✅ Built in ~45 minutes
