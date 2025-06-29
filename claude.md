# Three.js 1v1 Fighter Game

## IMPORTANT: Testing Requirements
**All features and changes MUST be tested using Playwright. Create comprehensive tests for every new feature, bug fix, or modification. Run tests frequently to ensure the game works correctly.**

## Project Overview
A 3D fighting game built with Three.js featuring 1v1 combat, fluid animations, and responsive controls. The game combines classic fighting game mechanics with modern 3D graphics and physics.

## Tech Stack
- **Three.js**: 3D graphics rendering
- **TypeScript**: Type-safe development
- **Vite**: Build tool and dev server
- **Cannon-es**: Physics engine for collision detection
- **GSAP**: Animation library for smooth transitions
- **Web Audio API**: Sound effects and music

## Core Game Mechanics

### Combat System
- **Basic Attacks**: Light punch, heavy punch, light kick, heavy kick
- **Special Moves**: Character-specific special attacks with cooldowns
- **Combos**: Chain attacks together for increased damage
- **Blocking**: Defensive stance to reduce damage
- **Health System**: Health bars with damage calculations
- **Stamina System**: Limits continuous attacks and movement

### Movement
- **3D Movement**: Forward/backward, left/right strafing
- **Jumping**: Single and double jumps
- **Dashing**: Quick movement bursts
- **Crouching**: Defensive position with different attacks

### Character Features
- **Multiple Fighters**: At least 2 unique characters with different movesets
- **Animations**: Idle, walk, run, jump, attack, hit reaction, block, KO
- **Hitboxes**: Accurate collision detection for attacks
- **Special Effects**: Particle effects for impacts and special moves

## Project Structure
```
Fighter/
├── src/
│   ├── main.ts                 # Entry point
│   ├── game/
│   │   ├── Game.ts             # Main game class
│   │   ├── GameStates.ts       # State management
│   │   └── InputManager.ts     # Input handling
│   ├── fighters/
│   │   ├── Fighter.ts          # Base fighter class
│   │   ├── FighterController.ts # Fighter controls
│   │   └── characters/         # Individual character classes
│   ├── combat/
│   │   ├── CombatSystem.ts     # Combat logic
│   │   ├── HitboxManager.ts    # Collision detection
│   │   └── ComboSystem.ts      # Combo tracking
│   ├── graphics/
│   │   ├── Scene.ts            # Three.js scene setup
│   │   ├── Camera.ts           # Camera controls
│   │   ├── Lighting.ts         # Scene lighting
│   │   └── Effects.ts          # Particle effects
│   ├── physics/
│   │   └── PhysicsWorld.ts     # Cannon-es physics
│   ├── ui/
│   │   ├── HUD.ts              # Health bars, timers
│   │   ├── Menu.ts             # Main menu
│   │   └── PauseMenu.ts        # Pause screen
│   └── audio/
│       └── AudioManager.ts      # Sound effects and music
├── assets/
│   ├── models/                 # 3D character models
│   ├── textures/               # Textures and materials
│   ├── sounds/                 # Audio files
│   └── animations/             # Animation data
├── public/
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Development Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Set up Vite + TypeScript + Three.js project
- [ ] Create basic scene with lighting and camera
- [ ] Implement input handling system
- [ ] Create fighter base class with basic movement
- [ ] Set up physics world with ground collision

### Phase 2: Combat Core (Week 3-4)
- [ ] Implement basic attack system
- [ ] Add hitbox detection
- [ ] Create health and damage system
- [ ] Implement blocking mechanics
- [ ] Add hit reactions and knockback

### Phase 3: Character Development (Week 5-6)
- [ ] Load and display 3D character models
- [ ] Implement animation system
- [ ] Create first complete character with full moveset
- [ ] Add second character with unique abilities
- [ ] Implement special moves

### Phase 4: Game Flow (Week 7)
- [ ] Create main menu
- [ ] Implement character selection
- [ ] Add round system (best of 3)
- [ ] Create victory/defeat screens
- [ ] Add pause functionality

### Phase 5: Polish (Week 8)
- [ ] Add particle effects for impacts
- [ ] Implement combo counter UI
- [ ] Add sound effects and music
- [ ] Performance optimization
- [ ] Bug fixes and balancing

## Technical Implementation Details

### Three.js Scene Setup
```typescript
// Basic scene initialization
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
```

### Fighter State Machine
```typescript
enum FighterState {
  IDLE,
  WALKING,
  JUMPING,
  ATTACKING,
  BLOCKING,
  HIT_STUN,
  KNOCKED_DOWN
}
```

### Input Mapping
- **WASD**: Movement
- **Space**: Jump
- **J**: Light Punch
- **K**: Heavy Punch
- **U**: Light Kick
- **I**: Heavy Kick
- **L**: Block
- **Shift**: Dash

### Performance Considerations
- Use object pooling for particle effects
- Implement LOD (Level of Detail) for character models
- Optimize collision detection with spatial partitioning
- Limit shadow-casting objects
- Use frustum culling

### Multiplayer Ready Architecture
- Separate game logic from rendering
- Deterministic physics simulation
- Input buffer system for rollback netcode
- State serialization for networking

## Key Challenges & Solutions

### Animation Blending
- Use Three.js AnimationMixer for smooth transitions
- Implement animation priority system
- Handle animation canceling for responsive controls

### Hitbox Accuracy
- Create multiple hitboxes per character (head, body, legs)
- Sync hitboxes with animation frames
- Visual debug mode for hitbox testing

### Camera System
- Dynamic camera that frames both fighters
- Smooth zoom based on fighter distance
- Handle wall collisions gracefully

## Resources & References
- Three.js documentation: https://threejs.org/docs/
- Fighting game design principles
- Character animation best practices
- WebGL performance optimization guides

## Testing Strategy
### Playwright Testing (MANDATORY)
- **Always write Playwright tests for ALL features**
- **Run tests after every change using `npm test`**
- **Create visual regression tests with screenshots**
- **Test all user interactions and game mechanics**
- **Test edge cases and error conditions**
- **Use `npm test:ui` for interactive debugging**
- **Use `npm test:headed` to see tests run in browser**

### Test Coverage Requirements
- Combat system: Attack detection, damage calculation, health updates
- Movement: All player controls, collision detection, boundaries
- Game flow: Win conditions, restart functionality, UI updates
- Input handling: Both player controls, simultaneous inputs
- Visual elements: Health bars, game messages, animations

### Additional Testing
- Unit tests for combat calculations
- Integration tests for game states
- Manual testing for feel and responsiveness
- Performance profiling on various devices

## Future Enhancements
- Online multiplayer support
- Additional characters and stages
- Training mode with combo practice
- Replay system
- Tournament mode