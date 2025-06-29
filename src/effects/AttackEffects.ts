import * as THREE from 'three';

export class AttackEffects {
  private scene: THREE.Scene;
  private activeEffects: Array<{
    group: THREE.Group;
    lifetime: number;
    maxLifetime: number;
  }> = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public createPunchEffect(position: THREE.Vector3, facingRight: boolean): void {
    const effectGroup = new THREE.Group();
    
    // Create impact flash
    const flashGeometry = new THREE.SphereGeometry(0.5, 8, 8);
    const flashMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      transparent: true,
      opacity: 0.8
    });
    const flash = new THREE.Mesh(flashGeometry, flashMaterial);
    flash.position.copy(position);
    effectGroup.add(flash);

    // Create motion lines
    for (let i = 0; i < 3; i++) {
      const lineGeometry = new THREE.BoxGeometry(0.8, 0.05, 0.05);
      const lineMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.6 - i * 0.2
      });
      const line = new THREE.Mesh(lineGeometry, lineMaterial);
      line.position.copy(position);
      line.position.x += (facingRight ? -0.3 : 0.3) * (i + 1);
      line.position.y += (Math.random() - 0.5) * 0.3;
      effectGroup.add(line);
    }

    // Create comic-style POW text
    const powSprite = this.createTextSprite('POW!', 0xffff00);
    powSprite.position.copy(position);
    powSprite.position.y += 1;
    powSprite.position.x += facingRight ? 0.5 : -0.5;
    effectGroup.add(powSprite);

    this.scene.add(effectGroup);
    this.activeEffects.push({
      group: effectGroup,
      lifetime: 0,
      maxLifetime: 0.3
    });
  }

  public createBlockEffect(position: THREE.Vector3): void {
    const effectGroup = new THREE.Group();
    
    // Create shield flash
    const shieldGeometry = new THREE.CircleGeometry(0.8, 6);
    const shieldMaterial = new THREE.MeshBasicMaterial({
      color: 0x00aaff,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    });
    const shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
    shield.position.copy(position);
    shield.position.z += 0.5;
    effectGroup.add(shield);

    // Create impact ripple
    const rippleGeometry = new THREE.RingGeometry(0.3, 0.5, 16);
    const rippleMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });
    const ripple = new THREE.Mesh(rippleGeometry, rippleMaterial);
    ripple.position.copy(position);
    ripple.position.z += 0.6;
    effectGroup.add(ripple);

    this.scene.add(effectGroup);
    this.activeEffects.push({
      group: effectGroup,
      lifetime: 0,
      maxLifetime: 0.2
    });
  }

  public createHitEffect(position: THREE.Vector3, blocked: boolean = false): void {
    const effectGroup = new THREE.Group();
    
    // Create star particles
    const starCount = blocked ? 3 : 5;
    for (let i = 0; i < starCount; i++) {
      const starGeometry = new THREE.ConeGeometry(0.15, 0.3, 4);
      const starMaterial = new THREE.MeshBasicMaterial({
        color: blocked ? 0x00aaff : 0xffaa00,
        transparent: true,
        opacity: 0.9
      });
      const star = new THREE.Mesh(starGeometry, starMaterial);
      
      // Random positioning
      const angle = (i / starCount) * Math.PI * 2;
      const distance = 0.3;
      star.position.set(
        position.x + Math.cos(angle) * distance,
        position.y + Math.sin(angle) * distance,
        position.z
      );
      star.rotation.z = angle;
      
      effectGroup.add(star);
    }

    // Add impact text
    if (!blocked) {
      const hitSprite = this.createTextSprite('WHAM!', 0xff6666);
      hitSprite.position.copy(position);
      hitSprite.position.y += 0.8;
      hitSprite.scale.multiplyScalar(0.8);
      effectGroup.add(hitSprite);
    }

    this.scene.add(effectGroup);
    this.activeEffects.push({
      group: effectGroup,
      lifetime: 0,
      maxLifetime: blocked ? 0.3 : 0.4
    });
  }

  private createTextSprite(text: string, color: number): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const context = canvas.getContext('2d')!;
    
    // Draw text
    context.font = 'bold 80px Arial Black';
    context.fillStyle = '#' + color.toString(16).padStart(6, '0');
    context.strokeStyle = '#000000';
    context.lineWidth = 8;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    context.strokeText(text, 128, 64);
    context.fillText(text, 128, 64);
    
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      transparent: true
    });
    
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(2, 1, 1);
    
    return sprite;
  }

  public update(deltaTime: number): void {
    // Update all active effects
    for (let i = this.activeEffects.length - 1; i >= 0; i--) {
      const effect = this.activeEffects[i];
      effect.lifetime += deltaTime;
      
      const progress = effect.lifetime / effect.maxLifetime;
      
      // Animate effects
      effect.group.children.forEach((child, index) => {
        if (child instanceof THREE.Mesh) {
          // Fade out
          if (child.material instanceof THREE.MeshBasicMaterial) {
            child.material.opacity = 1 - progress;
          }
          
          // Scale up slightly
          child.scale.setScalar(1 + progress * 0.5);
          
          // Move outward
          if (index > 0) {
            child.position.x *= 1 + deltaTime * 2;
            child.position.y += deltaTime * 0.5;
          }
        } else if (child instanceof THREE.Sprite) {
          // Sprite animation
          if (child.material) {
            child.material.opacity = 1 - progress;
          }
          child.position.y += deltaTime * 2;
          child.scale.multiplyScalar(1 + deltaTime * 0.5);
        }
      });
      
      // Remove finished effects
      if (effect.lifetime >= effect.maxLifetime) {
        this.scene.remove(effect.group);
        effect.group.traverse(child => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            if (child.material instanceof THREE.Material) {
              child.material.dispose();
            }
          } else if (child instanceof THREE.Sprite && child.material.map) {
            child.material.map.dispose();
            child.material.dispose();
          }
        });
        this.activeEffects.splice(i, 1);
      }
    }
  }

  public dispose(): void {
    // Clean up all active effects
    this.activeEffects.forEach(effect => {
      this.scene.remove(effect.group);
      effect.group.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (child.material instanceof THREE.Material) {
            child.material.dispose();
          }
        } else if (child instanceof THREE.Sprite && child.material.map) {
          child.material.map.dispose();
          child.material.dispose();
        }
      });
    });
    this.activeEffects = [];
  }
}