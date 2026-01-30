# Architecture Diagram - 9woke Bot System

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Minecraft Server                            │
│                     (MC_HOST:MC_PORT from .env)                     │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ Mineflayer Connection
                             │
         ┌───────────────────┴────────────────────┐
         │                                        │
┌────────▼──────────┐                  ┌─────────▼──────────┐
│  Director Bot     │                  │   Camera Bot       │
│  (Optional)       │                  │   (Optional)       │
│  - /give commands │                  │   - OBS recording  │
│  - /tp commands   │                  │   - Scene capture  │
└───────────────────┘                  └────────────────────┘
                             
         ┌───────────────────┴────────────────────┐
         │                                        │
┌────────▼──────────────────────────────────────────────────────┐
│                  Command Bus (command_bus.js)                  │
│             Coordinates all bots via JSON commands             │
│        File: data/bus/commands.json & runtime/*.jsonl         │
└─────────┬──────────────┬──────────────┬────────────┬─────────┘
          │              │              │            │
┌─────────▼────────┐ ┌──▼──────────┐ ┌─▼──────────┐ │
│ Tree Chopper Bot │ │City Builder │ │ Resource   │ │
│  tree_chopper    │ │     Bot     │ │ Manager    │ │
│   _bot.js        │ │city_builder │ │    Bot     │ │
│                  │ │  _bot.js    │ │resource_   │ │
│ • Find trees     │ │             │ │manager_    │ │
│ • Chop & collect │ │ • Blueprint │ │bot.js      │ │
│ • Replant        │ │   system    │ │            │ │
│ • Tool mgmt      │ │ • Build     │ │ • Inventory│ │
│ • Stats          │ │   types:    │ │   tracking │ │
│                  │ │   - House   │ │ • Resource │ │
│ Commands:        │ │   - Road    │ │   calc     │ │
│ - CHOP           │ │   - Plaza   │ │ • Chest    │ │
│                  │ │   - Tower   │ │   storage  │ │
│                  │ │   - Farm    │ │ • Auto-    │ │
│                  │ │   - Shop    │ │   craft    │ │
│                  │ │             │ │ • Priority │ │
│                  │ │ Commands:   │ │   decision │ │
│                  │ │ - BUILD_CITY│ │            │ │
│                  │ │ - BUILD_AREA│ │ Commands:  │ │
│                  │ │ - STATS     │ │ - STORE    │ │
└──────────────────┘ └─────────────┘ │ - RETRIEVE │ │
                                     │ - CRAFT    │ │
                                     │ - REPORT   │ │
                                     └────────────┘ │
                                                    │
                      ┌─────────────────────────────┘
                      │
         ┌────────────▼─────────────────────────────────┐
         │   Master Builder (civilization_bot.js)       │
         │        Enhanced with State Machine           │
         │                                              │
         │  State Machine Phases:                       │
         │  ┌────────────────────────────────────────┐  │
         │  │ 1. RESOURCE_GATHERING                  │  │
         │  │    - Chop trees (integrate tree_bot)   │  │
         │  │    - Check inventory (resource_bot)    │  │
         │  │    - Goal: 200+ wood                   │  │
         │  └────────────────────────────────────────┘  │
         │                    ↓                         │
         │  ┌────────────────────────────────────────┐  │
         │  │ 2. FOUNDATION                          │  │
         │  │    - Build base camp                   │  │
         │  │    - Set up initial structures         │  │
         │  └────────────────────────────────────────┘  │
         │                    ↓                         │
         │  ┌────────────────────────────────────────┐  │
         │  │ 3. CONSTRUCTION                        │  │
         │  │    - Build multiple houses             │  │
         │  │    - Use city_builder blueprints       │  │
         │  │    - Goal: 3+ buildings                │  │
         │  └────────────────────────────────────────┘  │
         │                    ↓                         │
         │  ┌────────────────────────────────────────┐  │
         │  │ 4. EXPANSION                           │  │
         │  │    - Add decorations                   │  │
         │  │    - Plant trees                       │  │
         │  │    - Finalize city                     │  │
         │  └────────────────────────────────────────┘  │
         │                    ↓                         │
         │                COMPLETE                      │
         │                                              │
         │  Commands:                                   │
         │  - START_AUTO_BUILD  → Enable auto mode     │
         │  - STOP_AUTO_BUILD   → Disable auto mode    │
         │  - SET_PHASE         → Manual phase control │
         │  - BUILD_CITY        → Build entire city    │
         │  - CHOP_TREE_ADVANCED→ Advanced chopping    │
         │  - STATS             → Show all statistics  │
         │                                              │
         │  Plus legacy commands:                       │
         │  - MOVE, CHOP, BUILD_HOUSE, CHAT            │
         └──────────────────────────────────────────────┘
                             │
         ┌───────────────────┴────────────────┐
         │                                    │
┌────────▼──────────┐              ┌─────────▼─────────┐
│  building_utils   │              │ Event Config      │
│     .js           │              │ city_building_    │
│                   │              │  project.json     │
│ Shared utilities: │              │                   │
│                   │              │ Defines:          │
│ • findNearestTree │              │ • Phases          │
│ • chopTreeComplete│              │ • Buildings       │
│ • placeBlock      │              │ • Resources       │
│   Pattern         │              │ • Timeline        │
│ • calculateMats   │              │ • Settings        │
│ • createBlueprint │              │                   │
│                   │              │ Building types:   │
│ Building types:   │              │ - 10 houses       │
│ - house           │              │ - 2 skyscrapers   │
│ - road            │              │ - 1 plaza         │
│ - plaza           │              │ - 3 farms         │
│ - skyscraper      │              │ - 5 shops         │
│ - farm            │              │                   │
│ - shop            │              │ Resource req:     │
│                   │              │ - 5000 planks     │
│                   │              │ - 8000 stone      │
│                   │              │ - 10000 bricks    │
└───────────────────┘              └───────────────────┘


Data Flow Example - Automated City Building:
═══════════════════════════════════════════════

1. User sends: { action: 'START_AUTO_BUILD' }
   ↓
2. civilization_bot.js sets autoMode = true, phase = 'resource_gathering'
   ↓
3. State machine loop (every 5s):
   Phase 1: RESOURCE_GATHERING
   ↓
4. civilization_bot calls building_utils.findNearestTree()
   ↓
5. civilization_bot uses building_utils.chopTreeComplete()
   ↓
6. Repeats until woodCount >= 200
   ↓
7. Phase advances to FOUNDATION
   ↓
8. Builds base camp using existing buildSimpleHouse()
   ↓
9. Phase advances to CONSTRUCTION
   ↓
10. Builds multiple houses (3+)
    ↓
11. Phase advances to EXPANSION
    ↓
12. Plants decorative trees, finalizes
    ↓
13. Phase = COMPLETE, autoMode = false
    ↓
14. Prints comprehensive statistics


Bot Communication via Command Bus:
═══════════════════════════════════

┌────────────────┐
│  Any Bot       │
│  (Sender)      │
└────────┬───────┘
         │
         │ bus.send({ action: 'BUILD_CITY', params: {...} })
         ↓
┌────────────────────────┐
│  Command Bus           │
│  Writes to:            │
│  data/bus/commands.json│
└────────┬───────────────┘
         │
         │ bus.poll() every 400-500ms
         ↓
┌────────────────┐
│  Any Bot       │
│  (Receiver)    │
│  Handles cmd   │
└────────────────┘


Statistics Tracking:
════════════════════

Tree Chopper Bot:
  ✓ Trees chopped
  ✓ Wood collected
  ✓ Saplings planted
  ✓ Axes crafted

City Builder Bot:
  ✓ Buildings completed
  ✓ Blocks placed
  ✓ Current phase

Resource Manager Bot:
  ✓ Inventory totals
  ✓ Stored materials
  ✓ Priority status

Master Builder:
  ✓ All above combined
  ✓ Phase progress
  ✓ Auto mode status


Environment Setup:
══════════════════

.env file:
  MC_HOST=127.0.0.1
  MC_PORT=25565
  MC_AUTH=offline
  MC_BOT_CIV_USERNAME=9woke
  MC_BOT_TREECHOP_USERNAME=9woke_treechop
  MC_BOT_CITYBUILDER_USERNAME=9woke_builder
  MC_BOT_RESOURCE_USERNAME=9woke_resource


NPM Scripts:
════════════

npm run bot:civ          → Master builder (with state machine)
npm run bot:treechop     → Standalone tree chopper
npm run bot:citybuilder  → Standalone city builder
npm run bot:resource     → Standalone resource manager
npm run bot:director     → Director (gives items, teleports)
npm run test:city        → Integration tests


Key Design Decisions:
═════════════════════

1. Modular bot architecture - each bot can run standalone or coordinated
2. Command bus for inter-bot communication (JSON files)
3. State machine for automated workflow (4 phases)
4. Blueprint system for flexible building (6 types)
5. Utility module for code reuse
6. Vietnamese comments per project convention
7. Async/await for all operations
8. Comprehensive error handling
9. Statistics tracking for monitoring
10. Configuration via JSON for easy customization
```
