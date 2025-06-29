import * as THREE from 'three';
import { CartoonMaterials } from '../graphics/CartoonMaterials';

export interface Platform {
  mesh: THREE.Mesh;
  bounds: THREE.Box3;
  type: 'solid' | 'jumpthrough';
  height: number;
}

export class PlatformSystem {
  private platforms: Platform[] = [];
  private scene: THREE.Scene;
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }
  
  public createPlatform(
    position: THREE.Vector3, 
    size: THREE.Vector3, 
    type: 'solid' | 'jumpthrough' = 'solid',
    color: number = 0x666666
  ): Platform {
    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    const material = CartoonMaterials.createToonMaterial(color);
    const mesh = new THREE.Mesh(geometry, material);
    
    mesh.position.copy(position);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    
    // Add visual indicator for jump-through platforms
    if (type === 'jumpthrough') {
      // Add stripes or different visual
      const stripesGeometry = new THREE.BoxGeometry(size.x * 0.98, size.y * 0.5, size.z * 1.01);
      const stripesMaterial = CartoonMaterials.createToonMaterial(0x444444);
      stripesMaterial.transparent = true;
      stripesMaterial.opacity = 0.5;
      const stripes = new THREE.Mesh(stripesGeometry, stripesMaterial);
      stripes.position.y = size.y * 0.25;
      mesh.add(stripes);
    }
    
    this.scene.add(mesh);
    
    // Add outline for better visibility
    CartoonMaterials.addOutlineToMesh(mesh, this.scene, 0.02);
    
    const platform: Platform = {
      mesh,
      bounds: new THREE.Box3().setFromObject(mesh),
      type,
      height: position.y + size.y / 2
    };
    
    this.platforms.push(platform);
    return platform;
  }
  
  public checkCollision(
    position: THREE.Vector3, 
    velocity: THREE.Vector3, 
    size: THREE.Vector3,
    wasAbove: boolean = false
  ): { 
    platform: Platform | null; 
    newPosition: THREE.Vector3; 
    isGrounded: boolean;
    canJumpThrough: boolean;
  } {
    const futurePosition = position.clone().add(velocity);
    const characterBox = new THREE.Box3(
      new THREE.Vector3(
        futurePosition.x - size.x / 2,
        futurePosition.y - size.y,
        futurePosition.z - size.z / 2
      ),
      new THREE.Vector3(
        futurePosition.x + size.x / 2,
        futurePosition.y,
        futurePosition.z + size.z / 2
      )
    );
    
    let closestPlatform: Platform | null = null;
    let closestDistance = Infinity;
    let isGrounded = false;
    let canJumpThrough = false;
    
    for (const platform of this.platforms) {
      // Update platform bounds in case it moved
      platform.bounds.setFromObject(platform.mesh);
      
      if (characterBox.intersectsBox(platform.bounds)) {
        const platformTop = platform.bounds.max.y;
        const characterBottom = characterBox.min.y;
        const distance = Math.abs(characterBottom - platformTop);
        
        // Check if character is landing on platform
        if (velocity.y <= 0 && distance < closestDistance) {
          // For jump-through platforms, only collide if coming from above
          if (platform.type === 'jumpthrough') {
            const wasAbovePlatform = position.y - size.y >= platformTop - 0.1;
            if (!wasAbovePlatform) {
              canJumpThrough = true;
              continue;
            }
          }
          
          closestPlatform = platform;
          closestDistance = distance;
        }
      }
    }
    
    const newPosition = futurePosition.clone();
    
    if (closestPlatform) {
      // Place character on top of platform
      newPosition.y = closestPlatform.bounds.max.y + size.y;
      isGrounded = true;
      
      // Check if still within platform horizontally
      const onPlatformX = newPosition.x >= closestPlatform.bounds.min.x - size.x / 2 &&
                         newPosition.x <= closestPlatform.bounds.max.x + size.x / 2;
      const onPlatformZ = newPosition.z >= closestPlatform.bounds.min.z - size.z / 2 &&
                         newPosition.z <= closestPlatform.bounds.max.z + size.z / 2;
      
      if (!onPlatformX || !onPlatformZ) {
        isGrounded = false;
        newPosition.y = futurePosition.y;
      }
    }
    
    return {
      platform: closestPlatform,
      newPosition,
      isGrounded,
      canJumpThrough
    };
  }
  
  public getPlatforms(): Platform[] {
    return this.platforms;
  }
  
  public dispose(): void {
    this.platforms.forEach(platform => {
      this.scene.remove(platform.mesh);
      platform.mesh.geometry.dispose();
      if (platform.mesh.material instanceof THREE.Material) {
        platform.mesh.material.dispose();
      }
    });
    this.platforms = [];
  }
}