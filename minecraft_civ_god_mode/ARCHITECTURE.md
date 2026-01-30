# Minecraft Mega Bot System - Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        USER INPUT INTERFACE                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────┐        ┌──────────────┐        ┌──────────────┐      │
│  │   STORY      │        │    IMAGE     │        │   COMMAND    │      │
│  │   INPUT      │        │    INPUT     │        │   CENTER     │      │
│  │              │        │              │        │              │      │
│  │  • Text      │        │  • JPG/PNG   │        │  • CLI       │      │
│  │  • File      │        │  • Analysis  │        │  • /commands │      │
│  │  • Examples  │        │  • Colors    │        │  • Monitor   │      │
│  └──────┬───────┘        └──────┬───────┘        └──────┬───────┘      │
│         │                       │                       │               │
└─────────┼───────────────────────┼───────────────────────┼───────────────┘
          │                       │                       │
          └───────────────┬───────┴───────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    LAYER 6: MASTER COORDINATION                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │              GRAND ORCHESTRATOR BOT                             │    │
│  │  ┌──────────────────────────────────────────────────────┐      │    │
│  │  │  State Machine:                                       │      │    │
│  │  │  INIT → ANALYZE → VISION → PLAN → GATHER →          │      │    │
│  │  │  FOUNDATION → BUILD → DETAILS → LANDSCAPE → DONE    │      │    │
│  │  └──────────────────────────────────────────────────────┘      │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                           │
│  ┌──────────────────┐  ┌────────────────────┐  ┌─────────────────┐    │
│  │ Progress         │  │ Emergency          │  │ Dashboard       │    │
│  │ Reporter         │  │ Response           │  │ Generator       │    │
│  │ • Every 5 min    │  │ • Crash detect     │  │ • HTML output   │    │
│  │ • Statistics     │  │ • Bot rescue       │  │ • Real-time     │    │
│  └──────────────────┘  └────────────────────┘  └─────────────────┘    │
│                                                                           │
└───────────────────────────────┬───────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐   ┌───────────────────┐   ┌──────────────────┐
│   LAYER 1:    │   │     LAYER 2:      │   │    LAYER 3:      │
│   CREATIVE    │   │    RESOURCES      │   │  CONSTRUCTION    │
├───────────────┤   ├───────────────────┤   ├──────────────────┤
│               │   │                   │   │                  │
│ Story         │   │ Lumberjack        │   │ Foundation       │
│ Analyzer      │   │ Squad (x10)       │   │ Builder          │
│               │   │                   │   │                  │
│ City          │   │ Miner Chief       │   │ Wall Builder     │
│ Architect     │   │ (x10 workers)     │   │ (x5 teams)       │
│               │   │                   │   │                  │
│ Theme         │   │ Farmer            │   │ Roof Builder     │
│ Designer      │   │                   │   │                  │
│               │   │ Fisherman         │   │ Interior         │
│ Image Vision  │   │                   │   │ Designer         │
│               │   │                   │   │                  │
│               │   │                   │   │ Road Paver       │
│               │   │                   │   │                  │
│               │   │                   │   │ Landscaper       │
│               │   │                   │   │                  │
│               │   │                   │   │ Skyscraper       │
│               │   │                   │   │ Specialist       │
└───────────────┘   └───────────────────┘   └──────────────────┘
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌───────────────┐   ┌───────────────────┐   ┌──────────────────┐
│   LAYER 4:    │   │     LAYER 5:      │   │   DATA LAYER     │
│   SUPPORT     │   │     DETAILS       │   │                  │
├───────────────┤   ├───────────────────┤   ├──────────────────┤
│               │   │                   │   │                  │
│ Supply Chain  │   │ Statue Builder    │   │ Building         │
│               │   │                   │   │ Templates        │
│ Courier       │   │ Sign Writer       │   │ • Houses         │
│ (x5)          │   │                   │   │ • Towers         │
│               │   │ Redstone          │   │ • Bridges        │
│ Inventory     │   │ Engineer          │   │ • Parks          │
│ Manager       │   │                   │   │                  │
│               │   │ Artist            │   │ Themes           │
│ Tool Smith    │   │                   │   │ • Medieval       │
│               │   │                   │   │ • Fantasy        │
│ Security      │   │                   │   │ • Modern         │
│               │   │                   │   │ • Steampunk      │
│ Night Shift   │   │                   │   │ • Oriental       │
│               │   │                   │   │                  │
└───────────────┘   └───────────────────┘   └──────────────────┘
        │                       │                       │
        └───────────────────────┴───────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        COMMUNICATION BUS                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  JSON File-Based Command Bus (data/bus/commands.json)                   │
│  • Bot Registration                                                      │
│  • Task Distribution                                                     │
│  • Status Updates                                                        │
│  • Event Notifications                                                   │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           MINECRAFT SERVER                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  • 50+ Bots connected                                                    │
│  • Building in progress                                                  │
│  • Real-time world modifications                                         │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘


DATA FLOW:
──────────

Story/Image Input → Story Analyzer/Image Vision → City Architect
      ↓                                                   ↓
Theme Designer ← Concepts & Themes              Master City Plan
      ↓                                                   ↓
Grand Orchestrator ← Building List + Theme       Task Queue
      ↓
┌─────┴─────┬─────────┬──────────┬─────────┐
│           │         │          │         │
Resource  Foundation  Building  Details  Landscape
Gathering   Layer     Phase     Phase     Phase
      │           │         │          │         │
      └───────────┴─────────┴──────────┴─────────┘
                      ↓
              Built City Complete!


BOT COUNT:
──────────
✅ Layer 6: 3 bots (Coordination)
✅ Layer 1: 4 bots (Creative)
✅ Layer 2: 23 bots (Resources - squad leaders + workers)
✅ Layer 3: 17 bots (Construction)
✅ Layer 4: 11 bots (Support)
✅ Layer 5: 4 bots (Details)
────────────────────
Total: 62 bots configured (11 implemented, rest documented)
```

## Key Features:

1. **Modular Architecture**: 6 independent layers
2. **Scalable Design**: Template for 50+ bots
3. **Story-Driven**: Natural language to building
4. **Image Support**: Visual analysis to blocks
5. **Coordinated**: State machine orchestration
6. **Monitored**: Real-time progress tracking
7. **Resilient**: Auto-recovery and backup
8. **Interactive**: Command center CLI

## Communication Flow:

```
User → Input Handler → Orchestrator → Bot Layer → Minecraft
  ↑                                        ↓
  └────────── Progress Reports ←───────────┘
```
