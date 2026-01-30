9WOKE Minecraft Real (GOD MODE B - real survival)

1) Copy this folder into your tool/ project OR run standalone.
2) Rename .env.example -> .env and edit MC_HOST/MC_PORT.
3) In Minecraft server, make sure you allow bots to join (online-mode/offline-mode accordingly).
4) OP either 9woke or DirectorBot if you want /give and /tp to work.

Run (3 terminals):
  npm install
  npm run bot:civ
  npm run bot:director
  npm run story

Or series:
  npm run series

=== NEW FEATURES: Tree Chopping & City Building ===

AUTOMATIC TREE CHOPPING BOT:
  npm run bot:treechop
  
  Features:
  - Tự động tìm và chặt cây trong bán kính 50 blocks
  - Thu thập gỗ và sapling
  - Tự động trồng lại cây (sustainable mode)
  - Quản lý inventory và craft rìu khi cần
  - Ghi log số lượng gỗ đã thu thập

CITY BUILDER BOT:
  npm run bot:citybuilder
  
  Features:
  - Xây dựng thành phố tự động theo blueprint
  - Hỗ trợ nhiều loại building: houses, roads, plaza, skyscrapers, farms, shops
  - Phong cách MrBeast Minecraft (massive scale)
  - Progress tracking và logging chi tiết

RESOURCE MANAGER BOT:
  npm run bot:resource
  
  Features:
  - Theo dõi inventory real-time
  - Tính toán tài nguyên cần thiết
  - Quản lý chest storage
  - Auto-craft vật liệu cơ bản
  - Đưa ra khuyến nghị ưu tiên (chặt cây vs xây dựng)

MASTER BUILDER (Enhanced civilization_bot.js):
  npm run bot:civ
  
  New Commands:
  - START_AUTO_BUILD: Bắt đầu xây dựng tự động (state machine)
  - STOP_AUTO_BUILD: Dừng xây dựng tự động
  - CHOP_TREE_ADVANCED: Chặt cây nâng cao với logging
  - BUILD_CITY: Xây dựng toàn bộ thành phố
  - STATS: Hiển thị thống kê
  
  State Machine Phases:
  1. Resource Gathering - Thu thập tài nguyên ban đầu
  2. Foundation - Thiết lập base camp
  3. Construction - Xây dựng các công trình chính
  4. Expansion - Mở rộng và hoàn thiện

TEST THE NEW FEATURES:
  npm run test:city
  
  This will test all integrated features including:
  - Bot communication
  - Tree chopping
  - Building commands
  - City project loading

CONFIGURATION:
  - City building project: data/events/city_building_project.json
  - Customize buildings, sizes, materials, phases
  - Enable/disable sustainable mode, auto-replant, etc.

TIPS:
  - Use /gamemode creative for faster building tests
  - Use /give commands to provide materials
  - Monitor logs for progress and debugging
  - Bots work together via command bus
  - All actions are logged with detailed markers

For full Vietnamese documentation, see README_VI.md

