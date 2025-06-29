import * as THREE from 'three';
import { StyleGuide, getRandomGraffitiColor } from './StyleGuide';
import { CartoonMaterials } from './CartoonMaterials';

export class StreetEnvironment {
  private scene: THREE.Scene;
  private group: THREE.Group;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);
  }

  public create(): void {
    this.createStreet();
    this.createSidewalks();
    this.createBuildings();
    this.createStreetDetails();
    this.createTrashCans();
    this.createGraffiti();
  }

  private createStreet(): void {
    const { streetWidth, streetDepth } = StyleGuide.environment;
    
    // Main street asphalt with toon shading
    const streetGeometry = new THREE.BoxGeometry(streetWidth, 0.1, streetDepth);
    const streetMaterial = CartoonMaterials.createToonMaterial(
      StyleGuide.colors.asphalt
    );
    
    const street = new THREE.Mesh(streetGeometry, streetMaterial);
    street.position.y = -0.05;
    street.receiveShadow = true;
    this.group.add(street);

    // Add street texture detail
    this.addStreetCracks(street);
    this.addLaneLines();
  }

  private addStreetCracks(street: THREE.Mesh): void {
    // Add dark lines to simulate cracks
    const crackMaterial = new THREE.MeshBasicMaterial({ 
      color: StyleGuide.colors.asphaltDark 
    });
    
    for (let i = 0; i < 5; i++) {
      const crackGeometry = new THREE.BoxGeometry(
        Math.random() * 3 + 1,
        0.11,
        0.05
      );
      const crack = new THREE.Mesh(crackGeometry, crackMaterial);
      crack.position.set(
        (Math.random() - 0.5) * StyleGuide.environment.streetWidth * 0.8,
        0,
        (Math.random() - 0.5) * StyleGuide.environment.streetDepth * 0.8
      );
      crack.rotation.y = Math.random() * Math.PI;
      this.group.add(crack);
    }
  }

  private addLaneLines(): void {
    const { laneLineWidth, laneLineLength, laneLineGap } = StyleGuide.environment;
    const lineMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffff00,
      emissive: 0xffff00,
      emissiveIntensity: 0.2
    });

    // Create dashed center line
    const totalLength = StyleGuide.environment.streetDepth;
    const segmentLength = laneLineLength + laneLineGap;
    const numSegments = Math.floor(totalLength / segmentLength);

    for (let i = 0; i < numSegments; i++) {
      const lineGeometry = new THREE.BoxGeometry(laneLineWidth, 0.11, laneLineLength);
      const line = new THREE.Mesh(lineGeometry, lineMaterial);
      line.position.set(
        0,
        0,
        -totalLength / 2 + i * segmentLength + laneLineLength / 2
      );
      this.group.add(line);
    }
  }

  private createSidewalks(): void {
    const { streetWidth, streetDepth, sidewalkHeight, curbHeight } = StyleGuide.environment;
    const sidewalkWidth = 4;
    
    const sidewalkMaterial = CartoonMaterials.createToonMaterial(
      StyleGuide.colors.sidewalk
    );

    const curbMaterial = CartoonMaterials.createToonMaterial(
      StyleGuide.colors.concrete
    );

    // Create sidewalks on both sides
    [-1, 1].forEach(side => {
      // Sidewalk
      const sidewalkGeometry = new THREE.BoxGeometry(
        sidewalkWidth,
        sidewalkHeight,
        streetDepth
      );
      const sidewalk = new THREE.Mesh(sidewalkGeometry, sidewalkMaterial);
      sidewalk.position.set(
        side * (streetWidth / 2 + sidewalkWidth / 2),
        sidewalkHeight / 2,
        0
      );
      sidewalk.receiveShadow = true;
      sidewalk.castShadow = true;
      this.group.add(sidewalk);

      // Curb
      const curbGeometry = new THREE.BoxGeometry(
        0.3,
        curbHeight,
        streetDepth
      );
      const curb = new THREE.Mesh(curbGeometry, curbMaterial);
      curb.position.set(
        side * (streetWidth / 2 - 0.15),
        curbHeight / 2,
        0
      );
      curb.castShadow = true;
      this.group.add(curb);
    });
  }

  private createBuildings(): void {
    const { buildingHeight, buildingDepth } = StyleGuide.environment;
    
    // Create buildings on both sides
    [-1, 1].forEach(side => {
      // Main building structure
      const buildingGeometry = new THREE.BoxGeometry(
        6,
        buildingHeight,
        buildingDepth
      );
      
      const buildingMaterial = CartoonMaterials.createToonMaterial(
        side > 0 ? StyleGuide.colors.buildingBrick : StyleGuide.colors.buildingConcrete
      );

      const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
      building.position.set(
        side * 13,
        buildingHeight / 2,
        -buildingDepth / 2
      );
      building.castShadow = true;
      building.receiveShadow = true;
      this.group.add(building);

      // Add windows
      this.addWindows(building, side);
      
      // Add a second smaller building
      const smallBuildingGeometry = new THREE.BoxGeometry(
        4,
        buildingHeight * 0.7,
        buildingDepth
      );
      const smallBuilding = new THREE.Mesh(smallBuildingGeometry, buildingMaterial);
      smallBuilding.position.set(
        side * 13,
        buildingHeight * 0.35,
        buildingDepth * 1.5
      );
      smallBuilding.castShadow = true;
      this.group.add(smallBuilding);
    });
  }

  private addWindows(building: THREE.Mesh, side: number): void {
    const windowMaterial = CartoonMaterials.createToonMaterial(
      0x1a1a1a,
      Math.random() > 0.5 ? 0xffff00 : 0x000000
    );

    const windowSize = 0.8;
    const windowSpacing = 1.5;
    const floorsCount = 4;
    const windowsPerFloor = 3;

    for (let floor = 0; floor < floorsCount; floor++) {
      for (let window = 0; window < windowsPerFloor; window++) {
        const windowGeometry = new THREE.BoxGeometry(windowSize, windowSize, 0.1);
        const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
        
        windowMesh.position.set(
          side * 13 + side * 3.1,
          2 + floor * 3,
          -2.5 + window * windowSpacing
        );
        
        this.group.add(windowMesh);
      }
    }
  }

  private createStreetDetails(): void {
    // Fire hydrant
    const hydrantGroup = new THREE.Group();
    
    // Base
    const hydrantBase = new THREE.CylinderGeometry(0.3, 0.35, 1.2, 8);
    const hydrantMaterial = CartoonMaterials.createToonMaterial(0xff0000);
    const hydrant = new THREE.Mesh(hydrantBase, hydrantMaterial);
    hydrant.position.y = 0.6;
    hydrantGroup.add(hydrant);
    
    // Top cap
    const capGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.2, 8);
    const cap = new THREE.Mesh(capGeometry, hydrantMaterial);
    cap.position.y = 1.3;
    hydrantGroup.add(cap);
    
    // Side outlets
    const outletGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.3, 6);
    [-1, 1].forEach(side => {
      const outlet = new THREE.Mesh(outletGeometry, hydrantMaterial);
      outlet.rotation.z = Math.PI / 2;
      outlet.position.set(side * 0.3, 0.8, 0);
      hydrantGroup.add(outlet);
    });
    
    hydrantGroup.position.set(8, 0.15, 5);
    hydrantGroup.castShadow = true;
    this.group.add(hydrantGroup);

    // Street sign
    this.createStreetSign();
  }

  private createStreetSign(): void {
    const signGroup = new THREE.Group();
    
    // Pole
    const poleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 3, 8);
    const poleMaterial = CartoonMaterials.createToonMaterial(0x404040);
    const pole = new THREE.Mesh(poleGeometry, poleMaterial);
    pole.position.y = 1.5;
    signGroup.add(pole);
    
    // Sign
    const signGeometry = new THREE.BoxGeometry(2, 0.8, 0.1);
    const signMaterial = CartoonMaterials.createToonMaterial(0x008000);
    const sign = new THREE.Mesh(signGeometry, signMaterial);
    sign.position.y = 2.5;
    sign.rotation.y = Math.PI / 4;
    signGroup.add(sign);
    
    // Add text texture (simulated with a smaller box)
    const textGeometry = new THREE.BoxGeometry(1.8, 0.6, 0.11);
    const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const text = new THREE.Mesh(textGeometry, textMaterial);
    text.position.set(0, 2.5, 0.06);
    text.rotation.y = Math.PI / 4;
    signGroup.add(text);
    
    signGroup.position.set(-7, 0.15, -4);
    signGroup.castShadow = true;
    this.group.add(signGroup);
  }

  private createTrashCans(): void {
    const trashCanMaterial = CartoonMaterials.createToonMaterial(0x404040);

    [{ x: 6, z: 3 }, { x: -5, z: -2 }].forEach(pos => {
      const trashGroup = new THREE.Group();
      
      // Body
      const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.35, 1, 8);
      const body = new THREE.Mesh(bodyGeometry, trashCanMaterial);
      body.position.y = 0.5;
      trashGroup.add(body);
      
      // Lid
      const lidGeometry = new THREE.CylinderGeometry(0.45, 0.45, 0.1, 8);
      const lid = new THREE.Mesh(lidGeometry, trashCanMaterial);
      lid.position.y = 1.05;
      trashGroup.add(lid);
      
      // Handle
      const handleGeometry = new THREE.TorusGeometry(0.15, 0.02, 4, 8, Math.PI);
      const handle = new THREE.Mesh(handleGeometry, trashCanMaterial);
      handle.position.y = 1.1;
      handle.rotation.x = -Math.PI / 2;
      trashGroup.add(handle);
      
      trashGroup.position.set(pos.x, 0.15, pos.z);
      trashGroup.castShadow = true;
      this.group.add(trashGroup);
    });
  }

  private createGraffiti(): void {
    // Create graffiti decals on walls
    const graffitiPositions = [
      { x: -13, y: 2, z: -2 },
      { x: 13, y: 3, z: 0 },
      { x: -13, y: 1.5, z: 1 }
    ];

    graffitiPositions.forEach(pos => {
      const size = Math.random() * 2 + 1;
      const graffitiGeometry = new THREE.PlaneGeometry(size, size * 0.6);
      const graffitiMaterial = new THREE.MeshBasicMaterial({
        color: getRandomGraffitiColor(),
        transparent: true,
        opacity: 0.8
      });
      
      const graffiti = new THREE.Mesh(graffitiGeometry, graffitiMaterial);
      graffiti.position.set(pos.x + (pos.x > 0 ? -3.01 : 3.01), pos.y, pos.z);
      graffiti.rotation.y = pos.x > 0 ? Math.PI / 2 : -Math.PI / 2;
      this.group.add(graffiti);
    });
  }

  public dispose(): void {
    // Clean up geometries and materials
    this.group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (child.material instanceof THREE.Material) {
          child.material.dispose();
        }
      }
    });
    
    this.scene.remove(this.group);
  }
}