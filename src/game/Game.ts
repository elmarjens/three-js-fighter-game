import * as THREE from 'three';
import { Scene } from '../graphics/Scene';
import { InputManager } from './InputManager';
import { Fighter } from '../fighters/Fighter';
import { AttackEffects } from '../effects/AttackEffects';
import { ParticleEffects } from '../effects/ParticleEffects';

export class Game {
  private scene: Scene;
  private inputManager: InputManager;
  private player1: Fighter;
  private player2: Fighter;
  private clock: THREE.Clock;
  private gameOver: boolean = false;
  private winner: number = 0;
  private attackEffects: AttackEffects;
  private particleEffects: ParticleEffects;
  private player1WasAttacking: boolean = false;
  private player2WasAttacking: boolean = false;
  private player1WasGrounded: boolean = true;
  private player2WasGrounded: boolean = true;
  
  constructor() {
    this.scene = new Scene();
    this.inputManager = new InputManager();
    this.clock = new THREE.Clock();
    this.attackEffects = new AttackEffects(this.scene.scene);
    this.particleEffects = new ParticleEffects(this.scene.scene);
    
    this.player1 = new Fighter(new THREE.Vector3(-3, 1, 0), 0x0000ff, 1);
    this.player2 = new Fighter(new THREE.Vector3(3, 1, 0), 0xff0000, 2);
    
    this.scene.scene.add(this.player1.mesh);
    this.scene.scene.add(this.player2.mesh);
    
    this.setupRestartListener();
    
    // Expose game instance for debugging
    (window as any).game = this;
  }

  public start(): void {
    this.gameLoop();
  }

  private gameLoop = (): void => {
    requestAnimationFrame(this.gameLoop);
    
    const deltaTime = this.clock.getDelta();
    
    if (!this.gameOver) {
      this.update(deltaTime);
    }
    
    this.scene.render();
  };

  private update(deltaTime: number): void {
    this.player1.update(this.inputManager.player1Input, deltaTime);
    this.player2.update(this.inputManager.player2Input, deltaTime);
    
    // Update dynamic camera
    this.scene.updateCamera(this.player1, this.player2, deltaTime);
    
    this.checkCombat();
    this.updateUI();
    this.checkWinCondition();
    this.attackEffects.update(deltaTime);
    this.particleEffects.update(deltaTime);
    
    // Track states for effects
    this.handleAttackEffects();
    this.handleMovementEffects();
  }

  private checkCombat(): void {
    if (this.player1.isAttacking && 
        this.player1.attackHitbox.intersectsBox(this.player2.hitbox) &&
        !this.player1.hasHitThisAttack) {
      this.player2.takeDamage(10);
      this.player1.hasHitThisAttack = true;
      
      // Create hit effect
      const hitPos = this.player2.mesh.position.clone();
      hitPos.y += 1;
      this.attackEffects.createHitEffect(hitPos, this.player2.isBlocking);
      
      // Camera shake on hit
      this.scene.shakeCamera(this.player2.isBlocking ? 0.2 : 0.4);
      
      // Add particle effects
      if (!this.player2.isBlocking) {
        this.particleEffects.createImpactStars(hitPos, 3);
      }
      
      // Create block effect if blocking
      if (this.player2.isBlocking) {
        const blockPos = this.player2.mesh.position.clone();
        blockPos.y += 0.8;
        blockPos.x += this.player2.facingRight ? -0.5 : 0.5;
        this.attackEffects.createBlockEffect(blockPos);
      }
    }
    
    if (this.player2.isAttacking && 
        this.player2.attackHitbox.intersectsBox(this.player1.hitbox) &&
        !this.player2.hasHitThisAttack) {
      this.player1.takeDamage(10);
      this.player2.hasHitThisAttack = true;
      
      // Create hit effect
      const hitPos = this.player1.mesh.position.clone();
      hitPos.y += 1;
      this.attackEffects.createHitEffect(hitPos, this.player1.isBlocking);
      
      // Camera shake on hit
      this.scene.shakeCamera(this.player1.isBlocking ? 0.2 : 0.4);
      
      // Add particle effects
      if (!this.player1.isBlocking) {
        this.particleEffects.createImpactStars(hitPos, 3);
      }
      
      // Create block effect if blocking
      if (this.player1.isBlocking) {
        const blockPos = this.player1.mesh.position.clone();
        blockPos.y += 0.8;
        blockPos.x += this.player1.facingRight ? -0.5 : 0.5;
        this.attackEffects.createBlockEffect(blockPos);
      }
    }
  }

  private updateUI(): void {
    const player1HealthBar = document.getElementById('player1-health')!;
    const player2HealthBar = document.getElementById('player2-health')!;
    
    player1HealthBar.style.width = `${(this.player1.health / this.player1.maxHealth) * 100}%`;
    player2HealthBar.style.width = `${(this.player2.health / this.player2.maxHealth) * 100}%`;
  }

  private checkWinCondition(): void {
    if (this.player1.health <= 0) {
      this.endGame(2);
    } else if (this.player2.health <= 0) {
      this.endGame(1);
    }
  }

  private endGame(winner: number): void {
    this.gameOver = true;
    this.winner = winner;
    
    // Set dramatic camera angle
    this.scene.dynamicCamera.setDramaticAngle('victory');
    
    const messageElement = document.getElementById('game-message')!;
    messageElement.textContent = `Player ${winner} Wins!`;
    messageElement.style.display = 'block';
    
    setTimeout(() => {
      messageElement.textContent += '\nPress R to restart';
    }, 1000);
  }

  private setupRestartListener(): void {
    window.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'r' && this.gameOver) {
        this.restart();
      }
    });
  }

  private restart(): void {
    this.gameOver = false;
    this.winner = 0;
    
    this.player1.reset(new THREE.Vector3(-3, 1, 0));
    this.player2.reset(new THREE.Vector3(3, 1, 0));
    
    // Reset camera
    this.scene.dynamicCamera.reset();
    
    const messageElement = document.getElementById('game-message')!;
    messageElement.style.display = 'none';
    
    this.updateUI();
  }
  
  private handleAttackEffects(): void {
    // Check if player just started attacking
    if (this.player1.isAttacking && !this.player1WasAttacking) {
      const effectPos = this.player1.mesh.position.clone();
      effectPos.x += this.player1.facingRight ? 1 : -1;
      effectPos.y += 0.5;
      this.attackEffects.createPunchEffect(effectPos, this.player1.facingRight);
    }
    
    if (this.player2.isAttacking && !this.player2WasAttacking) {
      const effectPos = this.player2.mesh.position.clone();
      effectPos.x += this.player2.facingRight ? 1 : -1;
      effectPos.y += 0.5;
      this.attackEffects.createPunchEffect(effectPos, this.player2.facingRight);
    }
    
    // Update attack states
    this.player1WasAttacking = this.player1.isAttacking;
    this.player2WasAttacking = this.player2.isAttacking;
  }
  
  private handleMovementEffects(): void {
    // Check for landing (dust clouds)
    if (!this.player1WasGrounded && this.player1.isGrounded) {
      const landPos = this.player1.mesh.position.clone();
      landPos.y = 0.1;
      this.particleEffects.createDustCloud(landPos);
    }
    
    if (!this.player2WasGrounded && this.player2.isGrounded) {
      const landPos = this.player2.mesh.position.clone();
      landPos.y = 0.1;
      this.particleEffects.createDustCloud(landPos);
    }
    
    // Fast movement effects
    if (Math.abs(this.player1.velocity.x) > 0.1 && this.player1.isGrounded) {
      if (Math.random() < 0.1) { // Occasional dust
        const dustPos = this.player1.mesh.position.clone();
        dustPos.y = 0;
        this.particleEffects.createDustCloud(dustPos, 0x6b5d54);
      }
    }
    
    if (Math.abs(this.player2.velocity.x) > 0.1 && this.player2.isGrounded) {
      if (Math.random() < 0.1) { // Occasional dust
        const dustPos = this.player2.mesh.position.clone();
        dustPos.y = 0;
        this.particleEffects.createDustCloud(dustPos, 0x6b5d54);
      }
    }
    
    // Sweat drops when low health
    if (this.player1.health < 30 && Math.random() < 0.02) {
      const sweatPos = this.player1.mesh.position.clone();
      sweatPos.y += 1.5;
      this.particleEffects.createSweatDrops(sweatPos);
    }
    
    if (this.player2.health < 30 && Math.random() < 0.02) {
      const sweatPos = this.player2.mesh.position.clone();
      sweatPos.y += 1.5;
      this.particleEffects.createSweatDrops(sweatPos);
    }
    
    // Update ground states
    this.player1WasGrounded = this.player1.isGrounded;
    this.player2WasGrounded = this.player2.isGrounded;
  }
}