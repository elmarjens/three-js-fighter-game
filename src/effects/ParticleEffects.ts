import * as THREE from 'three';

interface Particle {
  mesh: THREE.Mesh | THREE.Sprite;
  velocity: THREE.Vector3;
  lifetime: number;
  maxLifetime: number;
  rotationSpeed?: number;
  scale?: number;
  fadeOut?: boolean;
}

export class ParticleEffects {
  private scene: THREE.Scene;
  private particles: Particle[] = [];
  private particlePool: THREE.Mesh[] = [];
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.initializeParticlePool();
  }
  
  private initializeParticlePool(): void {
    // Pre-create particles for performance
    for (let i = 0; i < 50; i++) {
      const geometry = new THREE.SphereGeometry(0.1, 4, 4);
      const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true
      });
      const particle = new THREE.Mesh(geometry, material);
      particle.visible = false;
      this.scene.add(particle);
      this.particlePool.push(particle);
    }
  }
  
  public createDustCloud(position: THREE.Vector3, color: number = 0x8b7355): void {
    // Create multiple dust particles
    for (let i = 0; i < 8; i++) {
      const particle = this.getPooledParticle();
      if (!particle) continue;
      
      // Set dust properties
      const material = particle.material as THREE.MeshBasicMaterial;
      material.color.setHex(color);
      material.opacity = 0.6;
      
      // Random size for variety
      const scale = 0.3 + Math.random() * 0.4;
      particle.scale.setScalar(scale);
      
      // Position around impact point
      particle.position.copy(position);
      particle.position.x += (Math.random() - 0.5) * 0.5;
      particle.position.y += Math.random() * 0.2;
      particle.position.z += (Math.random() - 0.5) * 0.3;
      
      // Velocity spreading outward and up
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.15,
        0.1 + Math.random() * 0.1,
        (Math.random() - 0.5) * 0.1
      );
      
      this.particles.push({
        mesh: particle,
        velocity: velocity,
        lifetime: 0,
        maxLifetime: 0.8 + Math.random() * 0.4,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        fadeOut: true
      });
      
      particle.visible = true;
    }
  }
  
  public createSweatDrops(position: THREE.Vector3): void {
    // Create sweat drop particles
    for (let i = 0; i < 3; i++) {
      const dropGeometry = new THREE.SphereGeometry(0.08, 6, 6);
      const dropMaterial = new THREE.MeshBasicMaterial({
        color: 0x87ceeb,
        transparent: true,
        opacity: 0.8
      });
      const drop = new THREE.Mesh(dropGeometry, dropMaterial);
      
      // Position around head area
      drop.position.copy(position);
      drop.position.x += (Math.random() - 0.5) * 0.3;
      drop.position.y += 0.3 + Math.random() * 0.2;
      drop.position.z += 0.2;
      
      // Falling motion with slight spread
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.05,
        -0.2 - Math.random() * 0.1,
        0
      );
      
      this.scene.add(drop);
      
      this.particles.push({
        mesh: drop,
        velocity: velocity,
        lifetime: 0,
        maxLifetime: 0.6,
        scale: 1
      });
    }
  }
  
  public createImpactStars(position: THREE.Vector3, count: number = 5): void {
    // Create spinning stars around impact
    const radius = 0.5;
    
    for (let i = 0; i < count; i++) {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      
      // Draw star
      ctx.fillStyle = '#ffff00';
      ctx.strokeStyle = '#ff8800';
      ctx.lineWidth = 2;
      this.drawStar(ctx, 32, 32, 20, 10, 5);
      
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true
      });
      
      const star = new THREE.Sprite(spriteMaterial);
      
      // Position in circle around impact
      const angle = (i / count) * Math.PI * 2;
      star.position.copy(position);
      star.position.x += Math.cos(angle) * radius;
      star.position.y += Math.sin(angle) * radius;
      
      star.scale.setScalar(0.5);
      
      this.scene.add(star);
      
      // Circular motion
      const velocity = new THREE.Vector3(
        Math.cos(angle) * 0.1,
        Math.sin(angle) * 0.1,
        0
      );
      
      this.particles.push({
        mesh: star,
        velocity: velocity,
        lifetime: 0,
        maxLifetime: 0.5,
        rotationSpeed: 0.2,
        fadeOut: true
      });
    }
  }
  
  public createSpeedLines(position: THREE.Vector3, direction: THREE.Vector3): void {
    // Create motion lines for fast movement
    for (let i = 0; i < 4; i++) {
      const lineGeometry = new THREE.BoxGeometry(1.5, 0.02, 0.02);
      const lineMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.6 - i * 0.1
      });
      
      const line = new THREE.Mesh(lineGeometry, lineMaterial);
      line.position.copy(position);
      line.position.y += (Math.random() - 0.5) * 0.5;
      
      // Align with direction
      line.lookAt(position.clone().add(direction));
      
      this.scene.add(line);
      
      this.particles.push({
        mesh: line,
        velocity: direction.clone().multiplyScalar(-0.3),
        lifetime: 0,
        maxLifetime: 0.2,
        fadeOut: true
      });
    }
  }
  
  private drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, outerRadius: number, innerRadius: number, points: number): void {
    let rot = Math.PI / 2 * 3;
    const step = Math.PI / points;
    
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    
    for (let i = 0; i < points; i++) {
      let x = cx + Math.cos(rot) * outerRadius;
      let y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;
      
      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  
  private getPooledParticle(): THREE.Mesh | null {
    for (const particle of this.particlePool) {
      if (!particle.visible) {
        return particle;
      }
    }
    return null;
  }
  
  public update(deltaTime: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      particle.lifetime += deltaTime;
      
      // Update position
      particle.mesh.position.add(
        particle.velocity.clone().multiplyScalar(deltaTime)
      );
      
      // Apply gravity to some particles
      if (particle.velocity.y < 0 || particle.mesh instanceof THREE.Mesh) {
        particle.velocity.y -= deltaTime * 0.5;
      }
      
      // Rotation
      if (particle.rotationSpeed) {
        particle.mesh.rotation.z += particle.rotationSpeed;
      }
      
      // Fade out
      if (particle.fadeOut) {
        const progress = particle.lifetime / particle.maxLifetime;
        if (particle.mesh instanceof THREE.Sprite && particle.mesh.material) {
          particle.mesh.material.opacity = 1 - progress;
        } else if (particle.mesh instanceof THREE.Mesh) {
          const material = particle.mesh.material as THREE.MeshBasicMaterial;
          material.opacity = 1 - progress;
        }
      }
      
      // Scale animation
      if (particle.scale !== undefined) {
        const scaleProgress = particle.lifetime / particle.maxLifetime;
        particle.mesh.scale.setScalar(particle.scale * (1 + scaleProgress * 0.5));
      }
      
      // Remove expired particles
      if (particle.lifetime >= particle.maxLifetime) {
        if (this.particlePool.includes(particle.mesh as THREE.Mesh)) {
          // Return to pool
          particle.mesh.visible = false;
          particle.mesh.scale.setScalar(1);
          particle.mesh.rotation.set(0, 0, 0);
        } else {
          // Remove from scene
          this.scene.remove(particle.mesh);
          particle.mesh.geometry?.dispose();
          if (particle.mesh instanceof THREE.Sprite && particle.mesh.material.map) {
            particle.mesh.material.map.dispose();
          }
          (particle.mesh.material as THREE.Material)?.dispose();
        }
        
        this.particles.splice(i, 1);
      }
    }
  }
  
  public dispose(): void {
    // Clean up all particles
    this.particles.forEach(particle => {
      this.scene.remove(particle.mesh);
      if (!this.particlePool.includes(particle.mesh as THREE.Mesh)) {
        particle.mesh.geometry?.dispose();
        if (particle.mesh instanceof THREE.Sprite && particle.mesh.material.map) {
          particle.mesh.material.map.dispose();
        }
        (particle.mesh.material as THREE.Material)?.dispose();
      }
    });
    
    // Clean up pool
    this.particlePool.forEach(particle => {
      this.scene.remove(particle);
      particle.geometry.dispose();
      (particle.material as THREE.Material).dispose();
    });
    
    this.particles = [];
    this.particlePool = [];
  }
}