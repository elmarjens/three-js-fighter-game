import * as THREE from 'three';
import { StyleGuide } from '../graphics/StyleGuide';
import { CartoonMaterials } from '../graphics/CartoonMaterials';

export class FatKidCharacter {
  public group: THREE.Group;
  private mixer?: THREE.AnimationMixer;
  private bodyParts: {
    head: THREE.Mesh;
    body: THREE.Mesh;
    belly: THREE.Mesh;
    leftArm: THREE.Group;
    rightArm: THREE.Group;
    leftLeg: THREE.Group;
    rightLeg: THREE.Group;
  };

  constructor(playerNumber: number) {
    this.group = new THREE.Group();
    this.bodyParts = this.createCharacter(playerNumber);
    this.setupBones();
    
    // Apply cartoon outlines to the character
    this.addCharacterOutlines();
  }

  private createCharacter(playerNumber: number): any {
    const { bodyRatio, features } = StyleGuide.character;
    
    // Toon Materials for cartoon look
    const skinMaterial = CartoonMaterials.createToonMaterial(
      playerNumber === 1 ? StyleGuide.colors.skinTones.pale : StyleGuide.colors.skinTones.medium
    );

    const shirtMaterial = CartoonMaterials.createToonMaterial(
      playerNumber === 1 ? StyleGuide.colors.clothing.shirt1 : StyleGuide.colors.clothing.shirt2
    );

    const pantsMaterial = CartoonMaterials.createToonMaterial(
      StyleGuide.colors.clothing.shorts
    );

    const shoeMaterial = CartoonMaterials.createToonMaterial(
      StyleGuide.colors.clothing.shoes
    );

    // Head (large and round)
    const headGeometry = new THREE.SphereGeometry(bodyRatio.headSize, 16, 16);
    const head = new THREE.Mesh(headGeometry, skinMaterial);
    head.position.y = 1.2;
    head.castShadow = true;
    this.group.add(head);

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(features.eyeSize, 8, 8);
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-features.eyeSpacing/2, 1.2, bodyRatio.headSize - 0.05);
    this.group.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(features.eyeSpacing/2, 1.2, bodyRatio.headSize - 0.05);
    this.group.add(rightEye);

    // Body (wide and round)
    const bodyGeometry = new THREE.CylinderGeometry(
      bodyRatio.bodyWidth * 0.8,
      bodyRatio.bodyWidth,
      bodyRatio.bodyHeight,
      16
    );
    const body = new THREE.Mesh(bodyGeometry, shirtMaterial);
    body.position.y = 0.5;
    body.castShadow = true;
    this.group.add(body);

    // Belly (subtle protrusion)
    const bellyGeometry = new THREE.SphereGeometry(
      bodyRatio.bellySize * 0.4,
      16,
      16,
      0,
      Math.PI * 2,
      0,
      Math.PI / 2
    );
    const belly = new THREE.Mesh(bellyGeometry, shirtMaterial);
    belly.position.set(0, 0.4, bodyRatio.bellySize * 0.2);
    belly.rotation.x = Math.PI;
    belly.scale.set(1.2, 0.8, 1); // Flatten the belly a bit
    belly.castShadow = true;
    this.group.add(belly);

    // Arms (less stubby)
    const leftArm = this.createArm(skinMaterial, shirtMaterial);
    leftArm.position.set(-bodyRatio.bodyWidth * 0.8, 0.8, 0);
    this.group.add(leftArm);

    const rightArm = this.createArm(skinMaterial, shirtMaterial);
    rightArm.position.set(bodyRatio.bodyWidth * 0.8, 0.8, 0);
    this.group.add(rightArm);

    // Legs (chubby but not extremely thick)
    const leftLeg = this.createLeg(skinMaterial, pantsMaterial, shoeMaterial);
    leftLeg.position.set(-bodyRatio.bodyWidth * 0.35, 0, 0);
    this.group.add(leftLeg);

    const rightLeg = this.createLeg(skinMaterial, pantsMaterial, shoeMaterial);
    rightLeg.position.set(bodyRatio.bodyWidth * 0.35, 0, 0);
    this.group.add(rightLeg);

    // Add some character details
    this.addCharacterDetails(playerNumber, head);

    return {
      head,
      body,
      belly,
      leftArm,
      rightArm,
      leftLeg,
      rightLeg
    };
  }

  private createArm(skinMaterial: THREE.Material, shirtMaterial: THREE.Material): THREE.Group {
    const { bodyRatio, features } = StyleGuide.character;
    const armGroup = new THREE.Group();

    // Upper arm
    const upperArmGeometry = new THREE.CylinderGeometry(
      bodyRatio.armWidth * 0.4,
      bodyRatio.armWidth * 0.5,
      bodyRatio.armLength * 0.5,
      8
    );
    const upperArm = new THREE.Mesh(upperArmGeometry, shirtMaterial);
    upperArm.position.y = -bodyRatio.armLength * 0.25;
    upperArm.castShadow = true;
    armGroup.add(upperArm);

    // Lower arm
    const lowerArmGeometry = new THREE.CylinderGeometry(
      bodyRatio.armWidth * 0.3,
      bodyRatio.armWidth * 0.4,
      bodyRatio.armLength * 0.5,
      8
    );
    const lowerArm = new THREE.Mesh(lowerArmGeometry, skinMaterial);
    lowerArm.position.y = -bodyRatio.armLength * 0.75;
    lowerArm.castShadow = true;
    armGroup.add(lowerArm);

    // Hand (simple sphere)
    const handGeometry = new THREE.SphereGeometry(features.handSize, 8, 8);
    const hand = new THREE.Mesh(handGeometry, skinMaterial);
    hand.position.y = -bodyRatio.armLength - features.handSize * 0.5;
    hand.castShadow = true;
    armGroup.add(hand);

    return armGroup;
  }

  private createLeg(skinMaterial: THREE.Material, pantsMaterial: THREE.Material, shoeMaterial: THREE.Material): THREE.Group {
    const { bodyRatio, features } = StyleGuide.character;
    const legGroup = new THREE.Group();

    // Upper leg (shorts)
    const upperLegGeometry = new THREE.CylinderGeometry(
      bodyRatio.legWidth * 0.5,
      bodyRatio.legWidth * 0.6,
      bodyRatio.legLength * 0.6,
      8
    );
    const upperLeg = new THREE.Mesh(upperLegGeometry, pantsMaterial);
    upperLeg.position.y = -bodyRatio.legLength * 0.3;
    upperLeg.castShadow = true;
    legGroup.add(upperLeg);

    // Lower leg
    const lowerLegGeometry = new THREE.CylinderGeometry(
      bodyRatio.legWidth * 0.4,
      bodyRatio.legWidth * 0.45,
      bodyRatio.legLength * 0.4,
      8
    );
    const lowerLeg = new THREE.Mesh(lowerLegGeometry, skinMaterial);
    lowerLeg.position.y = -bodyRatio.legLength * 0.8;
    lowerLeg.castShadow = true;
    legGroup.add(lowerLeg);

    // Foot/Shoe
    const footGeometry = new THREE.BoxGeometry(
      features.footSize * 0.8,
      features.footSize * 0.4,
      features.footSize * 1.2
    );
    const foot = new THREE.Mesh(footGeometry, shoeMaterial);
    foot.position.y = -bodyRatio.legLength - features.footSize * 0.2;
    foot.position.z = features.footSize * 0.2;
    foot.castShadow = true;
    legGroup.add(foot);

    return legGroup;
  }

  private addCharacterDetails(playerNumber: number, head: THREE.Mesh): void {
    const { features } = StyleGuide.character;

    // Add a simple cap or hair
    if (playerNumber === 1) {
      // Baseball cap for player 1
      const capGeometry = new THREE.CylinderGeometry(
        StyleGuide.character.bodyRatio.headSize * 0.9,
        StyleGuide.character.bodyRatio.headSize * 0.9,
        0.05,
        16
      );
      const capMaterial = CartoonMaterials.createToonMaterial(0xff0000);
      const cap = new THREE.Mesh(capGeometry, capMaterial);
      cap.position.y = 1.45;
      this.group.add(cap);

      // Cap visor
      const visorGeometry = new THREE.BoxGeometry(
        StyleGuide.character.bodyRatio.headSize * 0.8,
        0.05,
        StyleGuide.character.bodyRatio.headSize * 0.5
      );
      const visor = new THREE.Mesh(visorGeometry, capMaterial);
      visor.position.set(0, 1.4, StyleGuide.character.bodyRatio.headSize * 0.3);
      this.group.add(visor);
    } else {
      // Messy hair for player 2
      const hairGeometry = new THREE.SphereGeometry(
        StyleGuide.character.bodyRatio.headSize * 0.9,
        8,
        8,
        0,
        Math.PI * 2,
        0,
        Math.PI / 2
      );
      const hairMaterial = CartoonMaterials.createToonMaterial(0x4b2c20);
      const hair = new THREE.Mesh(hairGeometry, hairMaterial);
      hair.position.y = 1.35;
      this.group.add(hair);
    }

    // Mouth (simple line)
    const mouthGeometry = new THREE.BoxGeometry(features.mouthWidth, 0.02, 0.02);
    const mouthMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
    mouth.position.set(0, 1.1, StyleGuide.character.bodyRatio.headSize - 0.05);
    this.group.add(mouth);

    // Ears
    const earGeometry = new THREE.SphereGeometry(features.earSize, 6, 6);
    const earMaterial = CartoonMaterials.createToonMaterial(
      playerNumber === 1 ? StyleGuide.colors.skinTones.pale : StyleGuide.colors.skinTones.medium
    );
    
    const leftEar = new THREE.Mesh(earGeometry, earMaterial);
    leftEar.position.set(-StyleGuide.character.bodyRatio.headSize * 0.9, 1.2, 0);
    leftEar.scale.set(0.5, 1, 1);
    this.group.add(leftEar);

    const rightEar = new THREE.Mesh(earGeometry, earMaterial);
    rightEar.position.set(StyleGuide.character.bodyRatio.headSize * 0.9, 1.2, 0);
    rightEar.scale.set(0.5, 1, 1);
    this.group.add(rightEar);
  }

  private setupBones(): void {
    // Set up simple rotation points for animation
    this.bodyParts.leftArm.userData.rotationPoint = new THREE.Vector3(0, 0, 0);
    this.bodyParts.rightArm.userData.rotationPoint = new THREE.Vector3(0, 0, 0);
    this.bodyParts.leftLeg.userData.rotationPoint = new THREE.Vector3(0, 0, 0);
    this.bodyParts.rightLeg.userData.rotationPoint = new THREE.Vector3(0, 0, 0);
  }

  public animateWalk(time: number): void {
    // Bouncy walk animation
    const walkSpeed = 5;
    const bounce = Math.sin(time * walkSpeed) * StyleGuide.animation.walkBounce;
    
    // Body bounce
    this.group.position.y = bounce;
    
    // Arm swing
    this.bodyParts.leftArm.rotation.x = Math.sin(time * walkSpeed) * 0.3;
    this.bodyParts.rightArm.rotation.x = -Math.sin(time * walkSpeed) * 0.3;
    
    // Leg movement
    this.bodyParts.leftLeg.rotation.x = -Math.sin(time * walkSpeed) * 0.4;
    this.bodyParts.rightLeg.rotation.x = Math.sin(time * walkSpeed) * 0.4;
    
    // Belly jiggle
    const jiggle = Math.sin(time * walkSpeed * 2) * StyleGuide.animation.bellyJiggle;
    this.bodyParts.belly.scale.set(1 + jiggle, 1 - jiggle * 0.5, 1 + jiggle);
  }

  public animateIdle(time: number): void {
    // Subtle breathing animation
    const breathSpeed = 2;
    const breathAmount = 0.02;
    
    this.bodyParts.body.scale.y = 1 + Math.sin(time * breathSpeed) * breathAmount;
    this.bodyParts.belly.scale.set(
      1 + Math.sin(time * breathSpeed) * breathAmount * 2,
      1,
      1 + Math.sin(time * breathSpeed) * breathAmount * 2
    );
  }

  public animateAttack(): void {
    // Quick punch animation
    this.bodyParts.rightArm.rotation.x = -Math.PI / 2;
    this.bodyParts.rightArm.rotation.z = -0.3;
  }

  public animateBlock(): void {
    // Defensive pose
    this.bodyParts.leftArm.rotation.x = -Math.PI / 3;
    this.bodyParts.rightArm.rotation.x = -Math.PI / 3;
    this.bodyParts.leftArm.rotation.z = 0.5;
    this.bodyParts.rightArm.rotation.z = -0.5;
  }

  public animateJump(progress: number): void {
    // Squash and stretch for jump
    if (progress < 0.3) {
      // Squash before jump
      const squash = 1 - StyleGuide.animation.jumpSquash * (progress / 0.3);
      this.group.scale.set(1 + StyleGuide.animation.jumpSquash * 0.5, squash, 1);
    } else if (progress > 0.7) {
      // Squash on landing
      const landProgress = (progress - 0.7) / 0.3;
      const squash = 1 - StyleGuide.animation.landingSquash * (1 - landProgress);
      this.group.scale.set(1 + StyleGuide.animation.landingSquash * 0.5, squash, 1);
    } else {
      // Stretch during jump
      this.group.scale.set(0.9, 1.1, 1);
    }
    
    // Flail arms
    this.bodyParts.leftArm.rotation.z = Math.PI / 4;
    this.bodyParts.rightArm.rotation.z = -Math.PI / 4;
  }

  public resetPose(): void {
    // Reset all rotations and scales
    this.bodyParts.leftArm.rotation.set(0, 0, 0);
    this.bodyParts.rightArm.rotation.set(0, 0, 0);
    this.bodyParts.leftLeg.rotation.set(0, 0, 0);
    this.bodyParts.rightLeg.rotation.set(0, 0, 0);
    this.group.scale.set(1, 1, 1);
    this.group.position.y = 0;
  }

  public dispose(): void {
    // Remove outlines first
    CartoonMaterials.removeOutlines(this.group);
    
    this.group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (child.material instanceof THREE.Material) {
          child.material.dispose();
        }
      }
    });
  }
  
  private addCharacterOutlines(): void {
    // Add black outlines to main body parts for cartoon effect
    const outlinesToAdd = [
      this.bodyParts.head,
      this.bodyParts.body,
      this.bodyParts.belly
    ];
    
    outlinesToAdd.forEach(mesh => {
      if (mesh instanceof THREE.Mesh) {
        CartoonMaterials.addOutlineToMesh(mesh, this.group, 0.02);
      }
    });
    
    // Add thinner outlines to limbs
    [this.bodyParts.leftArm, this.bodyParts.rightArm, 
     this.bodyParts.leftLeg, this.bodyParts.rightLeg].forEach(limb => {
      limb.traverse((child) => {
        if (child instanceof THREE.Mesh && child.geometry) {
          CartoonMaterials.addOutlineToMesh(child, this.group, 0.015);
        }
      });
    });
  }
}