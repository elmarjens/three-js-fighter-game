import * as THREE from 'three';
import { PlayerInput } from '../game/InputManager';
import { FatKidCharacter } from './FatKidCharacter';
import { RealisticCharacter } from './RealisticCharacter';
import { PlatformSystem } from '../physics/Platform';

export type CharacterStyle = 'cartoon' | 'realistic';

export class Fighter {
  public mesh: THREE.Group;
  public character: FatKidCharacter | RealisticCharacter;
  public health: number = 100;
  public maxHealth: number = 100;
  public stamina: number = 100;
  public maxStamina: number = 100;
  public velocity: THREE.Vector3;
  public isGrounded: boolean = true;
  public isAttacking: boolean = false;
  public isBlocking: boolean = false;
  public blockStun: number = 0;
  public attackCooldown: number = 0;
  public facingRight: boolean;
  public hitbox: THREE.Box3;
  public attackHitbox: THREE.Box3;
  public playerNumber: number;
  public hasHitThisAttack: boolean = false;
  private animationTime: number = 0;
  private isMoving: boolean = false;
  private debugMesh?: THREE.Mesh; // For visualizing attack hitbox

  private readonly MOVE_SPEED = 0.15;
  private readonly JUMP_FORCE = 0.4;
  private readonly GRAVITY = -0.02;
  private readonly GROUND_Y = 0.5; // Lowered for platform gameplay
  private readonly ATTACK_RANGE = 1.0;
  private readonly ATTACK_DURATION = 0.2;
  private readonly ATTACK_COOLDOWN = 0.8;
  private readonly STAMINA_DRAIN_RATE = 25; // Stamina per second while blocking
  private readonly STAMINA_REGEN_RATE = 15; // Stamina per second while not blocking
  private readonly BLOCK_STAMINA_COST = 10; // Stamina cost per blocked hit
  private readonly ATTACK_STAMINA_COST = 15; // Stamina cost per attack
  private attackTimer: number = 0;
  private currentPlatform: any = null;
  private wasAbovePlatform: boolean = false;

  constructor(position: THREE.Vector3, color: number, playerNumber: number, style: CharacterStyle = 'cartoon') {
    this.playerNumber = playerNumber;
    this.facingRight = playerNumber === 1;
    
    // Create character based on style
    if (style === 'realistic') {
      this.character = new RealisticCharacter(playerNumber);
    } else {
      this.character = new FatKidCharacter(playerNumber);
    }
    this.mesh = this.character.group;
    this.mesh.position.copy(position);
    
    // Face the correct direction
    if (!this.facingRight) {
      this.mesh.rotation.y = Math.PI;
    }

    this.velocity = new THREE.Vector3(0, 0, 0);
    this.hitbox = new THREE.Box3();
    this.attackHitbox = new THREE.Box3();
    this.updateHitboxes();
  }

  public update(input: PlayerInput, deltaTime: number, platformSystem?: PlatformSystem): void {
    this.handleBlocking(input, deltaTime);
    this.handleMovement(input);
    this.handleAttack(input);
    this.applyPhysics(platformSystem);
    this.updateHitboxes();
    this.updateStamina(deltaTime);
    
    // Update animation time
    this.animationTime += deltaTime;
    
    // Handle attack timing
    if (this.isAttacking) {
      this.attackTimer += deltaTime;
      if (this.attackTimer >= this.ATTACK_DURATION) {
        this.isAttacking = false;
        this.hasHitThisAttack = false;
        if (this.character instanceof RealisticCharacter) {
          this.character.updateAnimation('idle');
        } else {
          this.character.resetPose();
        }
      }
    }
    
    if (this.attackCooldown > 0) {
      this.attackCooldown -= deltaTime;
    }
    
    // Handle block stun
    if (this.blockStun > 0) {
      this.blockStun -= deltaTime;
      this.isBlocking = this.blockStun > 0;
    }
    
    // Handle animations
    this.updateAnimations();
  }

  private handleBlocking(input: PlayerInput, deltaTime: number): void {
    // Can only block if we have stamina and not in block stun
    if (this.blockStun > 0) {
      return;
    }
    
    this.isBlocking = input.block && !this.isAttacking && this.isGrounded && this.stamina > 0;
    
    // Drain stamina while blocking
    if (this.isBlocking) {
      this.stamina = Math.max(0, this.stamina - this.STAMINA_DRAIN_RATE * deltaTime);
      if (this.stamina <= 0) {
        this.isBlocking = false;
        this.blockStun = 1.0; // Guard broken - stunned for 1 second
      }
    }
  }

  private handleMovement(input: PlayerInput): void {
    // Can't move while blocking
    if (this.isBlocking) {
      this.velocity.x *= 0.8;
      this.isMoving = false;
      return;
    }
    
    this.isMoving = false;
    
    if (input.left) {
      this.velocity.x = -this.MOVE_SPEED;
      this.facingRight = false;
      this.isMoving = true;
    } else if (input.right) {
      this.velocity.x = this.MOVE_SPEED;
      this.facingRight = true;
      this.isMoving = true;
    } else {
      this.velocity.x *= 0.8;
    }
    
    // Update character facing direction
    this.mesh.rotation.y = this.facingRight ? 0 : Math.PI;

    if (input.jump && this.isGrounded) {
      this.velocity.y = this.JUMP_FORCE;
      this.isGrounded = false;
    }
    
    // Drop through jumpthrough platforms
    if (input.down && this.currentPlatform?.type === 'jumpthrough') {
      this.mesh.position.y -= 0.5;
      this.currentPlatform = null;
      this.isGrounded = false;
    }
  }

  private handleAttack(input: PlayerInput): void {
    // Can't attack while blocking, on cooldown, or without stamina
    if (input.punch && this.attackCooldown <= 0 && !this.isAttacking && !this.isBlocking && 
        this.stamina >= this.ATTACK_STAMINA_COST && this.blockStun <= 0) {
      this.isAttacking = true;
      this.attackTimer = 0;
      this.attackCooldown = this.ATTACK_COOLDOWN;
      this.hasHitThisAttack = false;
      this.stamina = Math.max(0, this.stamina - this.ATTACK_STAMINA_COST);
    }
  }

  private applyPhysics(platformSystem?: PlatformSystem): void {
    this.velocity.y += this.GRAVITY;
    
    // Track if we were above platform before movement
    this.wasAbovePlatform = this.mesh.position.y > (this.currentPlatform?.height || 0);
    
    // Check platform collisions if system is available
    if (platformSystem) {
      const characterSize = new THREE.Vector3(1, 2, 1);
      const collision = platformSystem.checkCollision(
        this.mesh.position,
        this.velocity,
        characterSize,
        this.wasAbovePlatform
      );
      
      if (collision.isGrounded) {
        this.mesh.position.copy(collision.newPosition);
        this.velocity.y = 0;
        this.isGrounded = true;
        this.currentPlatform = collision.platform;
      } else {
        this.mesh.position.add(this.velocity);
        this.currentPlatform = null;
      }
    } else {
      // Fallback to ground collision
      this.mesh.position.add(this.velocity);
    }

    // Ground collision
    if (this.mesh.position.y <= this.GROUND_Y) {
      this.mesh.position.y = this.GROUND_Y;
      this.velocity.y = 0;
      this.isGrounded = true;
      this.currentPlatform = null;
    }

    // Expanded boundaries for larger play area
    this.mesh.position.x = Math.max(-14, Math.min(14, this.mesh.position.x));
  }

  private updateHitboxes(): void {
    // Create a temporary box to calculate bounds
    const boundingBox = new THREE.Box3();
    boundingBox.setFromObject(this.mesh);
    this.hitbox.copy(boundingBox);
    
    if (this.isAttacking) {
      const attackOffset = this.facingRight ? this.ATTACK_RANGE : -this.ATTACK_RANGE;
      const attackCenter = this.mesh.position.clone();
      attackCenter.x += attackOffset;
      attackCenter.y += 0.5; // Adjust for character height
      
      this.attackHitbox.setFromCenterAndSize(
        attackCenter,
        new THREE.Vector3(1.5, 1.5, 1)
      );
    } else {
      this.attackHitbox.makeEmpty();
    }
  }

  private updateAnimations(): void {
    // Apply appropriate animations based on state
    if (this.character instanceof RealisticCharacter) {
      // Realistic character animation
      if (this.isAttacking) {
        this.character.updateAnimation('attack', {
          type: 'punch',
          progress: this.attackTimer / this.ATTACK_DURATION
        });
      } else if (this.isBlocking) {
        this.character.updateAnimation('block');
      } else if (!this.isGrounded) {
        // Jump animation based on velocity
        const jumpProgress = this.velocity.y > 0 ? 0.3 : 0.8;
        this.character.updateAnimation('jump', { progress: jumpProgress });
      } else if (this.isMoving) {
        this.character.updateAnimation('walk', { progress: this.animationTime });
      } else {
        this.character.updateAnimation('idle');
      }
    } else {
      // Cartoon character animation (FatKidCharacter)
      if (this.isAttacking) {
        this.character.animateAttack();
      } else if (this.isBlocking) {
        this.character.animateBlock();
      } else if (!this.isGrounded) {
        // Jump animation based on velocity
        const jumpProgress = this.velocity.y > 0 ? 0.3 : 0.8;
        this.character.animateJump(jumpProgress);
      } else if (this.isMoving) {
        this.character.animateWalk(this.animationTime);
      } else {
        this.character.animateIdle(this.animationTime);
      }
    }
  }

  private updateStamina(deltaTime: number): void {
    // Regenerate stamina when not blocking or attacking
    if (!this.isBlocking && !this.isAttacking && this.blockStun <= 0) {
      this.stamina = Math.min(this.maxStamina, this.stamina + this.STAMINA_REGEN_RATE * deltaTime);
    }
  }

  public takeDamage(damage: number): void {
    if (this.isBlocking && this.stamina >= this.BLOCK_STAMINA_COST) {
      // Full block - no damage but costs stamina
      this.stamina = Math.max(0, this.stamina - this.BLOCK_STAMINA_COST);
      
      // Small pushback when blocking
      const knockbackDirection = this.facingRight ? -0.1 : 0.1;
      this.velocity.x = knockbackDirection;
      
      // Check for guard break
      if (this.stamina <= 0) {
        this.blockStun = 1.0; // Guard broken
        this.isBlocking = false;
      }
    } else {
      // Full damage when not blocking or out of stamina
      this.health = Math.max(0, this.health - damage);
      
      // Full knockback
      const knockbackDirection = this.facingRight ? -0.3 : 0.3;
      this.velocity.x = knockbackDirection;
      this.velocity.y = 0.1;
    }
  }

  public reset(position: THREE.Vector3): void {
    this.mesh.position.copy(position);
    this.velocity.set(0, 0, 0);
    this.health = this.maxHealth;
    this.stamina = this.maxStamina;
    this.isAttacking = false;
    this.isBlocking = false;
    this.attackCooldown = 0;
    this.isGrounded = true;
    this.hasHitThisAttack = false;
    this.blockStun = 0;
  }
}