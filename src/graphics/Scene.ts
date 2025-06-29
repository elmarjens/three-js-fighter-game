import * as THREE from 'three';
import { StreetEnvironment } from './StreetEnvironment';
import { StyleGuide } from './StyleGuide';
import { DynamicCamera } from './DynamicCamera';
import { Fighter } from '../fighters/Fighter';

export class Scene {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public dynamicCamera: DynamicCamera;
  public streetEnvironment: StreetEnvironment;

  constructor() {
    this.scene = new THREE.Scene();
    // Dusk sky color for street atmosphere
    this.scene.background = new THREE.Color(StyleGuide.colors.duskSky);
    this.scene.fog = new THREE.Fog(StyleGuide.colors.duskSky, 20, 50);

    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    
    // Initialize dynamic camera
    this.dynamicCamera = new DynamicCamera(this.camera);
    this.dynamicCamera.reset();

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('app')!.appendChild(this.renderer.domElement);

    this.setupLighting();
    this.createEnvironment();
    this.handleResize();
  }

  private setupLighting(): void {
    // Enhanced ambient light for PBR materials
    const ambientLight = new THREE.AmbientLight(
      StyleGuide.lighting.ambient.color,
      StyleGuide.lighting.ambient.intensity * 0.8
    );
    this.scene.add(ambientLight);
    
    // Add hemisphere light for more realistic ambient lighting
    const hemisphereLight = new THREE.HemisphereLight(
      0x87ceeb, // Sky color
      0x362712, // Ground color
      0.3
    );
    this.scene.add(hemisphereLight);

    // Enhanced sunset directional light with better shadows
    const sunLight = new THREE.DirectionalLight(
      StyleGuide.lighting.sun.color,
      StyleGuide.lighting.sun.intensity * 1.2
    );
    sunLight.position.set(
      StyleGuide.lighting.sun.position.x,
      StyleGuide.lighting.sun.position.y,
      StyleGuide.lighting.sun.position.z
    );
    sunLight.castShadow = true;
    sunLight.shadow.camera.left = -15;
    sunLight.shadow.camera.right = 15;
    sunLight.shadow.camera.top = 15;
    sunLight.shadow.camera.bottom = -15;
    sunLight.shadow.camera.near = 0.1;
    sunLight.shadow.camera.far = 50;
    sunLight.shadow.mapSize.width = 4096;
    sunLight.shadow.mapSize.height = 4096;
    sunLight.shadow.bias = -0.0005;
    sunLight.shadow.normalBias = 0.02;
    this.scene.add(sunLight);
    
    // Add fill light for better character illumination
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(-5, 5, 5);
    this.scene.add(fillLight);
    
    // Add rim light for character definition
    const rimLight = new THREE.DirectionalLight(0xfff5f0, 0.3);
    rimLight.position.set(0, 3, -8);
    this.scene.add(rimLight);

    // Add street lights
    this.addStreetLights();
  }

  private createEnvironment(): void {
    // Create the street environment with platforms
    this.streetEnvironment = new StreetEnvironment(this.scene);
    this.streetEnvironment.create();
  }

  private addStreetLights(): void {
    // Add street lights on both sides
    const streetLightPositions = [
      { x: -8, z: -5 },
      { x: -8, z: 5 },
      { x: 8, z: -5 },
      { x: 8, z: 5 }
    ];

    streetLightPositions.forEach(pos => {
      const light = new THREE.PointLight(
        StyleGuide.lighting.streetLights.color,
        StyleGuide.lighting.streetLights.intensity,
        StyleGuide.lighting.streetLights.distance,
        StyleGuide.lighting.streetLights.decay
      );
      light.position.set(pos.x, 4, pos.z);
      light.castShadow = true;
      light.shadow.mapSize.width = 1024;
      light.shadow.mapSize.height = 1024;
      this.scene.add(light);

      // Add visible light fixture
      const fixtureGeometry = new THREE.SphereGeometry(0.3, 8, 8);
      const fixtureMaterial = new THREE.MeshBasicMaterial({
        color: StyleGuide.lighting.streetLights.color,
        emissive: StyleGuide.lighting.streetLights.color,
        emissiveIntensity: 1
      });
      const fixture = new THREE.Mesh(fixtureGeometry, fixtureMaterial);
      fixture.position.copy(light.position);
      this.scene.add(fixture);
    });
  }

  private handleResize(): void {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  public render(): void {
    this.renderer.render(this.scene, this.camera);
  }
  
  public updateCamera(player1: Fighter, player2: Fighter, deltaTime: number): void {
    this.dynamicCamera.update(player1, player2, deltaTime);
  }
  
  public shakeCamera(intensity: number = 0.5): void {
    this.dynamicCamera.shake(intensity);
  }
}