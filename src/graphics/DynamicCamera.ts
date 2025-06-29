import * as THREE from 'three';
import { Fighter } from '../fighters/Fighter';

export class DynamicCamera {
  private camera: THREE.PerspectiveCamera;
  private basePosition: THREE.Vector3;
  private targetPosition: THREE.Vector3;
  private targetLookAt: THREE.Vector3;
  private currentLookAt: THREE.Vector3;
  
  // Camera settings
  private readonly MIN_DISTANCE = 8;
  private readonly MAX_DISTANCE = 15;
  private readonly MIN_HEIGHT = 2.5;
  private readonly MAX_HEIGHT = 4;
  private readonly CAMERA_SMOOTHING = 0.05;
  private readonly LOOK_SMOOTHING = 0.08;
  private readonly CAMERA_OFFSET_Y = 1.5;
  
  // Shake effect
  private shakeIntensity: number = 0;
  private shakeDecay: number = 0.95;
  
  constructor(camera: THREE.PerspectiveCamera) {
    this.camera = camera;
    this.basePosition = new THREE.Vector3(0, 3, 12);
    this.targetPosition = this.basePosition.clone();
    this.targetLookAt = new THREE.Vector3(0, 1, 0);
    this.currentLookAt = this.targetLookAt.clone();
  }
  
  public update(player1: Fighter, player2: Fighter, deltaTime: number): void {
    // Calculate center point between fighters
    const centerX = (player1.mesh.position.x + player2.mesh.position.x) / 2;
    const centerY = (player1.mesh.position.y + player2.mesh.position.y) / 2;
    
    // Calculate distance between fighters
    const distance = Math.abs(player1.mesh.position.x - player2.mesh.position.x);
    
    // Calculate camera distance based on fighter separation
    const normalizedDistance = Math.min(distance / 10, 1);
    const cameraDistance = THREE.MathUtils.lerp(
      this.MIN_DISTANCE,
      this.MAX_DISTANCE,
      normalizedDistance
    );
    
    // Calculate camera height based on distance
    const cameraHeight = THREE.MathUtils.lerp(
      this.MIN_HEIGHT,
      this.MAX_HEIGHT,
      normalizedDistance
    );
    
    // Set target position
    this.targetPosition.set(
      centerX,
      cameraHeight + this.CAMERA_OFFSET_Y,
      cameraDistance
    );
    
    // Set target look at position (slightly above center)
    this.targetLookAt.set(centerX, centerY + 0.5, 0);
    
    // Apply camera shake if active
    if (this.shakeIntensity > 0.01) {
      this.targetPosition.x += (Math.random() - 0.5) * this.shakeIntensity;
      this.targetPosition.y += (Math.random() - 0.5) * this.shakeIntensity * 0.5;
      this.shakeIntensity *= this.shakeDecay;
    }
    
    // Smooth camera movement
    this.camera.position.lerp(this.targetPosition, this.CAMERA_SMOOTHING);
    
    // Smooth look at
    this.currentLookAt.lerp(this.targetLookAt, this.LOOK_SMOOTHING);
    this.camera.lookAt(this.currentLookAt);
    
    // Add subtle camera sway for more dynamic feel
    const time = Date.now() * 0.001;
    this.camera.position.x += Math.sin(time * 0.5) * 0.05;
    this.camera.position.y += Math.sin(time * 0.7) * 0.03;
  }
  
  public shake(intensity: number = 0.5): void {
    this.shakeIntensity = Math.min(intensity, 1);
  }
  
  public reset(): void {
    this.camera.position.copy(this.basePosition);
    this.camera.lookAt(0, 1, 0);
    this.currentLookAt.set(0, 1, 0);
    this.shakeIntensity = 0;
  }
  
  // Special camera angles for dramatic moments
  public setDramaticAngle(type: 'victory' | 'knockout' | 'special'): void {
    switch (type) {
      case 'victory':
        this.targetPosition.set(3, 2, 8);
        this.targetLookAt.set(0, 1.5, 0);
        break;
      case 'knockout':
        this.targetPosition.set(-2, 0.5, 6);
        this.targetLookAt.set(0, 0.5, 0);
        break;
      case 'special':
        this.targetPosition.set(0, 5, 10);
        this.targetLookAt.set(0, 1, 0);
        break;
    }
  }
}