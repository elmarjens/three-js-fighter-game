import * as THREE from 'three';
import { PlayerInput } from '../game/InputManager';

export class Fighter {
  public mesh: THREE.Mesh;
  public health: number = 100;
  public maxHealth: number = 100;
  public velocity: THREE.Vector3;
  public isGrounded: boolean = true;
  public isAttacking: boolean = false;
  public attackCooldown: number = 0;
  public facingRight: boolean;
  public hitbox: THREE.Box3;
  public attackHitbox: THREE.Box3;
  public playerNumber: number;
  private debugMesh?: THREE.Mesh; // For visualizing attack hitbox

  private readonly MOVE_SPEED = 0.15;
  private readonly JUMP_FORCE = 0.4;
  private readonly GRAVITY = -0.02;
  private readonly GROUND_Y = 1;
  private readonly ATTACK_RANGE = 2.0;
  private readonly ATTACK_DURATION = 0.3;
  private readonly ATTACK_COOLDOWN = 0.5;

  constructor(position: THREE.Vector3, color: number, playerNumber: number) {
    this.playerNumber = playerNumber;
    this.facingRight = playerNumber === 1;
    
    const geometry = new THREE.BoxGeometry(1, 2, 1);
    const material = new THREE.MeshPhongMaterial({ color });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(position);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    this.velocity = new THREE.Vector3(0, 0, 0);
    this.hitbox = new THREE.Box3();
    this.attackHitbox = new THREE.Box3();
    this.updateHitboxes();
  }

  public update(input: PlayerInput, deltaTime: number): void {
    this.handleMovement(input);
    this.handleAttack(input);
    this.applyPhysics();
    this.updateHitboxes();
    
    if (this.attackCooldown > 0) {
      this.attackCooldown -= deltaTime;
      if (this.attackCooldown <= 0) {
        this.isAttacking = false;
      }
    }
  }

  private handleMovement(input: PlayerInput): void {
    if (input.left) {
      this.velocity.x = -this.MOVE_SPEED;
      this.facingRight = false;
    } else if (input.right) {
      this.velocity.x = this.MOVE_SPEED;
      this.facingRight = true;
    } else {
      this.velocity.x *= 0.8;
    }

    if (input.jump && this.isGrounded) {
      this.velocity.y = this.JUMP_FORCE;
      this.isGrounded = false;
    }
  }

  private handleAttack(input: PlayerInput): void {
    if (input.punch && this.attackCooldown <= 0 && !this.isAttacking) {
      this.isAttacking = true;
      this.attackCooldown = this.ATTACK_COOLDOWN;
    }
  }

  private applyPhysics(): void {
    this.velocity.y += this.GRAVITY;
    
    this.mesh.position.add(this.velocity);

    if (this.mesh.position.y <= this.GROUND_Y) {
      this.mesh.position.y = this.GROUND_Y;
      this.velocity.y = 0;
      this.isGrounded = true;
    }

    this.mesh.position.x = Math.max(-8, Math.min(8, this.mesh.position.x));
  }

  private updateHitboxes(): void {
    this.hitbox.setFromObject(this.mesh);
    
    if (this.isAttacking) {
      const attackOffset = this.facingRight ? this.ATTACK_RANGE : -this.ATTACK_RANGE;
      const attackCenter = this.mesh.position.clone();
      attackCenter.x += attackOffset;
      
      this.attackHitbox.setFromCenterAndSize(
        attackCenter,
        new THREE.Vector3(1, 1, 1)
      );
    } else {
      this.attackHitbox.makeEmpty();
    }
  }

  public takeDamage(damage: number): void {
    this.health = Math.max(0, this.health - damage);
    
    const knockbackDirection = this.facingRight ? -0.3 : 0.3;
    this.velocity.x = knockbackDirection;
    this.velocity.y = 0.1;
  }

  public reset(position: THREE.Vector3): void {
    this.mesh.position.copy(position);
    this.velocity.set(0, 0, 0);
    this.health = this.maxHealth;
    this.isAttacking = false;
    this.attackCooldown = 0;
    this.isGrounded = true;
  }
}