import * as THREE from 'three';
import { StyleGuide } from '../graphics/StyleGuide';
import { RealisticMaterials } from '../graphics/RealisticMaterials';

export class RealisticCharacter {
  public group: THREE.Group;
  private mixer?: THREE.AnimationMixer;
  private bodyParts: {
    head: THREE.Group;
    torso: THREE.Group;
    leftArm: THREE.Group;
    rightArm: THREE.Group;
    leftLeg: THREE.Group;
    rightLeg: THREE.Group;
    hands: {
      left: THREE.Group;
      right: THREE.Group;
    };
  };
  private skeleton: THREE.Skeleton;
  private bones: THREE.Bone[];

  constructor(playerNumber: number) {
    this.group = new THREE.Group();
    this.bones = [];
    this.bodyParts = this.createCharacter(playerNumber);
    this.skeleton = this.setupSkeleton();
    
    // Add subtle animations
    this.setupIdleAnimation();
  }

  private createCharacter(playerNumber: number): any {
    const { bodyRatio, features } = StyleGuide.realisticCharacter;
    const { realistic } = StyleGuide.materials;
    
    // Materials
    const skinMaterial = RealisticMaterials.createSkinMaterial(
      playerNumber === 1 ? StyleGuide.colors.skinTones.pale : StyleGuide.colors.skinTones.medium,
      {
        roughness: realistic.skin.roughness,
        subsurfaceIntensity: realistic.skin.subsurfaceIntensity
      }
    );

    const shirtMaterial = RealisticMaterials.createFabricMaterial(
      playerNumber === 1 ? StyleGuide.colors.clothing.shirt1 : StyleGuide.colors.clothing.shirt2,
      { roughness: realistic.fabric.roughness }
    );

    const shortsMaterial = RealisticMaterials.createFabricMaterial(
      StyleGuide.colors.clothing.shorts,
      { roughness: realistic.fabric.roughness }
    );

    const shoeMaterial = RealisticMaterials.createLeatherMaterial(
      StyleGuide.colors.clothing.shoes
    );

    // Create body parts
    const head = this.createHead(skinMaterial, playerNumber);
    const torso = this.createTorso(shirtMaterial, skinMaterial);
    const leftArm = this.createArm(skinMaterial, shirtMaterial, 'left');
    const rightArm = this.createArm(skinMaterial, shirtMaterial, 'right');
    const leftLeg = this.createLeg(skinMaterial, shortsMaterial, shoeMaterial, 'left');
    const rightLeg = this.createLeg(skinMaterial, shortsMaterial, shoeMaterial, 'right');
    
    // Create hands with fingers
    const hands = {
      left: this.createHand(skinMaterial, 'left'),
      right: this.createHand(skinMaterial, 'right')
    };
    
    // Position body parts
    head.position.y = 1.5;
    torso.position.y = 0.8;
    leftArm.position.set(-bodyRatio.shoulderWidth / 2, 1.3, 0);
    rightArm.position.set(bodyRatio.shoulderWidth / 2, 1.3, 0);
    leftLeg.position.set(-bodyRatio.hipWidth / 4, 0, 0);
    rightLeg.position.set(bodyRatio.hipWidth / 4, 0, 0);
    
    // Attach hands to arms
    hands.left.position.y = -bodyRatio.armLength;
    hands.right.position.y = -bodyRatio.armLength;
    leftArm.add(hands.left);
    rightArm.add(hands.right);
    
    // Add all to group
    this.group.add(head, torso, leftArm, rightArm, leftLeg, rightLeg);
    
    return { head, torso, leftArm, rightArm, leftLeg, rightLeg, hands };
  }

  private createHead(skinMaterial: THREE.Material, playerNumber: number): THREE.Group {
    const headGroup = new THREE.Group();
    const { bodyRatio, features } = StyleGuide.realisticCharacter;
    
    // Head shape (more oval/realistic)
    const headGeometry = new THREE.SphereGeometry(bodyRatio.headSize, 24, 24);
    headGeometry.scale(1, 1.15, 0.95); // Elongate slightly
    const head = new THREE.Mesh(headGeometry, skinMaterial);
    head.castShadow = true;
    head.receiveShadow = true;
    head.name = 'head';
    headGroup.add(head);
    
    // Neck
    const neckGeometry = new THREE.CylinderGeometry(
      bodyRatio.headSize * 0.4,
      bodyRatio.headSize * 0.5,
      bodyRatio.neckLength,
      12
    );
    const neck = new THREE.Mesh(neckGeometry, skinMaterial);
    neck.position.y = -bodyRatio.headSize - bodyRatio.neckLength / 2;
    neck.name = 'neck';
    headGroup.add(neck);
    
    // Facial features will be added separately
    this.addFacialFeatures(headGroup, skinMaterial, playerNumber);
    
    // Hair
    const hairMaterial = RealisticMaterials.createHairMaterial(
      playerNumber === 1 ? 0x4a2c2a : 0x1a1a1a,
      playerNumber === 1 ? 'straight' : 'messy'
    );
    const hair = this.createHair(bodyRatio.headSize, hairMaterial, playerNumber);
    hair.position.y = bodyRatio.headSize * 0.3;
    headGroup.add(hair);
    
    return headGroup;
  }

  private createHair(headSize: number, material: THREE.Material, playerNumber: number): THREE.Mesh {
    if (playerNumber === 1) {
      // Shorter, neater hair
      const hairGeometry = new THREE.SphereGeometry(headSize * 1.05, 16, 16);
      hairGeometry.scale(1, 0.7, 1);
      const hair = new THREE.Mesh(hairGeometry, material);
      hair.name = 'hair';
      return hair;
    } else {
      // Messier, spikier hair
      const hairGroup = new THREE.Group();
      const baseHair = new THREE.SphereGeometry(headSize * 1.02, 16, 16);
      baseHair.scale(1, 0.8, 1);
      const baseMesh = new THREE.Mesh(baseHair, material);
      baseMesh.name = 'hair';
      hairGroup.add(baseMesh);
      
      // Add some spikes
      for (let i = 0; i < 5; i++) {
        const spikeGeometry = new THREE.ConeGeometry(headSize * 0.15, headSize * 0.3, 6);
        const spike = new THREE.Mesh(spikeGeometry, material);
        const angle = (i / 5) * Math.PI * 2;
        spike.position.set(
          Math.sin(angle) * headSize * 0.7,
          headSize * 0.2,
          Math.cos(angle) * headSize * 0.7
        );
        spike.rotation.z = angle * 0.3;
        spike.name = 'hair';
        hairGroup.add(spike);
      }
      
      return hairGroup as any;
    }
  }

  private addFacialFeatures(headGroup: THREE.Group, skinMaterial: THREE.Material, playerNumber: number): void {
    const { features } = StyleGuide.realisticCharacter;
    
    // Eyes
    const eyeWhiteMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
    const irisMaterial = new THREE.MeshStandardMaterial({ 
      color: playerNumber === 1 ? 0x4682b4 : 0x8b4513,
      roughness: 0.3,
      metalness: 0.1
    });
    const pupilMaterial = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.8 });
    
    [-1, 1].forEach(side => {
      // Eye socket (slight indent)
      const socketGeometry = new THREE.SphereGeometry(features.eyeSize * 1.5, 12, 12);
      socketGeometry.scale(1.2, 1, 0.6);
      const socket = new THREE.Mesh(socketGeometry, skinMaterial);
      socket.position.set(
        side * features.eyeSpacing,
        features.eyeHeight,
        StyleGuide.realisticCharacter.bodyRatio.headSize - 0.02
      );
      headGroup.add(socket);
      
      // Eyeball
      const eyeGeometry = new THREE.SphereGeometry(features.eyeSize, 16, 16);
      const eye = new THREE.Mesh(eyeGeometry, eyeWhiteMaterial);
      eye.position.set(
        side * features.eyeSpacing,
        features.eyeHeight,
        StyleGuide.realisticCharacter.bodyRatio.headSize - 0.01
      );
      eye.castShadow = true;
      headGroup.add(eye);
      
      // Iris
      const irisGeometry = new THREE.CircleGeometry(features.irisSize, 16);
      const iris = new THREE.Mesh(irisGeometry, irisMaterial);
      iris.position.set(
        side * features.eyeSpacing,
        features.eyeHeight,
        StyleGuide.realisticCharacter.bodyRatio.headSize + features.eyeSize - 0.005
      );
      headGroup.add(iris);
      
      // Pupil
      const pupilGeometry = new THREE.CircleGeometry(features.pupilSize, 12);
      const pupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
      pupil.position.set(
        side * features.eyeSpacing,
        features.eyeHeight,
        StyleGuide.realisticCharacter.bodyRatio.headSize + features.eyeSize - 0.003
      );
      headGroup.add(pupil);
    });
    
    // Nose
    const noseGeometry = new THREE.ConeGeometry(features.noseWidth / 2, features.noseLength, 8);
    noseGeometry.rotateX(Math.PI);
    const nose = new THREE.Mesh(noseGeometry, skinMaterial);
    nose.position.set(0, features.noseHeight, StyleGuide.realisticCharacter.bodyRatio.headSize + 0.02);
    nose.rotation.x = -0.3;
    nose.castShadow = true;
    nose.name = 'nose';
    headGroup.add(nose);
    
    // Nostrils
    [-1, 1].forEach(side => {
      const nostrilGeometry = new THREE.SphereGeometry(features.noseWidth * 0.15, 6, 6);
      const nostril = new THREE.Mesh(nostrilGeometry, new THREE.MeshStandardMaterial({ 
        color: 0x000000, 
        roughness: 1 
      }));
      nostril.position.set(
        side * features.noseWidth * 0.2,
        features.noseHeight - features.noseLength * 0.3,
        StyleGuide.realisticCharacter.bodyRatio.headSize + 0.01
      );
      nostril.scale.set(1, 0.5, 0.3);
      headGroup.add(nostril);
    });
    
    // Mouth
    const mouthShape = new THREE.Shape();
    mouthShape.moveTo(-features.mouthWidth / 2, 0);
    mouthShape.quadraticCurveTo(0, -features.lipThickness, features.mouthWidth / 2, 0);
    mouthShape.quadraticCurveTo(0, features.lipThickness, -features.mouthWidth / 2, 0);
    
    const mouthGeometry = new THREE.ShapeGeometry(mouthShape);
    const mouthMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xcc6666, 
      roughness: 0.6 
    });
    const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
    mouth.position.set(0, features.mouthHeight, StyleGuide.realisticCharacter.bodyRatio.headSize);
    headGroup.add(mouth);
    
    // Ears
    [-1, 1].forEach(side => {
      const earGeometry = new THREE.SphereGeometry(features.earSize, 8, 8);
      earGeometry.scale(0.5, 1.2, 0.3);
      const ear = new THREE.Mesh(earGeometry, skinMaterial);
      ear.position.set(
        side * (StyleGuide.realisticCharacter.bodyRatio.headSize + features.earSize * 0.3),
        features.earHeight,
        0
      );
      ear.rotation.y = side * 0.3;
      ear.castShadow = true;
      ear.name = 'ear';
      headGroup.add(ear);
    });
  }

  private createTorso(shirtMaterial: THREE.Material, skinMaterial: THREE.Material): THREE.Group {
    const torsoGroup = new THREE.Group();
    const { bodyRatio, features } = StyleGuide.realisticCharacter;
    
    // Upper torso (chest)
    const chestGeometry = new THREE.BoxGeometry(
      bodyRatio.shoulderWidth,
      bodyRatio.bodyHeight * 0.5,
      bodyRatio.bodyWidth
    );
    // Taper towards waist
    const chestVertices = chestGeometry.attributes.position;
    for (let i = 0; i < chestVertices.count; i++) {
      const y = chestVertices.getY(i);
      if (y < 0) {
        const taper = 1 - (Math.abs(y) / (bodyRatio.bodyHeight * 0.25)) * 0.2;
        chestVertices.setX(i, chestVertices.getX(i) * taper);
        chestVertices.setZ(i, chestVertices.getZ(i) * taper);
      }
    }
    chestGeometry.attributes.position.needsUpdate = true;
    
    const chest = new THREE.Mesh(chestGeometry, shirtMaterial);
    chest.position.y = bodyRatio.bodyHeight * 0.25;
    chest.castShadow = true;
    chest.receiveShadow = true;
    torsoGroup.add(chest);
    
    // Lower torso (abdomen)
    const abdomenGeometry = new THREE.BoxGeometry(
      bodyRatio.waistWidth,
      bodyRatio.bodyHeight * 0.5,
      bodyRatio.bodyWidth * 0.9
    );
    const abdomen = new THREE.Mesh(abdomenGeometry, shirtMaterial);
    abdomen.position.y = -bodyRatio.bodyHeight * 0.25;
    abdomen.castShadow = true;
    abdomen.receiveShadow = true;
    torsoGroup.add(abdomen);
    
    // Add muscle definition (pectorals)
    if (features.pectoralDefinition > 0) {
      [-1, 1].forEach(side => {
        const pecGeometry = new THREE.SphereGeometry(
          bodyRatio.shoulderWidth * 0.2,
          8,
          8
        );
        pecGeometry.scale(1.2, 0.8, 0.5);
        const pec = new THREE.Mesh(pecGeometry, shirtMaterial);
        pec.position.set(
          side * bodyRatio.shoulderWidth * 0.25,
          bodyRatio.bodyHeight * 0.35,
          bodyRatio.bodyWidth * 0.4
        );
        torsoGroup.add(pec);
      });
    }
    
    return torsoGroup;
  }

  private createArm(skinMaterial: THREE.Material, shirtMaterial: THREE.Material, side: 'left' | 'right'): THREE.Group {
    const armGroup = new THREE.Group();
    const { bodyRatio } = StyleGuide.realisticCharacter;
    const sideMultiplier = side === 'left' ? -1 : 1;
    
    // Upper arm
    const upperArmGeometry = new THREE.CylinderGeometry(
      bodyRatio.armWidth * 0.6,
      bodyRatio.armWidth * 0.5,
      bodyRatio.armLength * 0.45,
      12
    );
    const upperArm = new THREE.Mesh(upperArmGeometry, shirtMaterial);
    upperArm.position.y = -bodyRatio.armLength * 0.225;
    upperArm.castShadow = true;
    armGroup.add(upperArm);
    
    // Elbow joint
    const elbowGeometry = new THREE.SphereGeometry(bodyRatio.armWidth * 0.5, 8, 8);
    const elbow = new THREE.Mesh(elbowGeometry, skinMaterial);
    elbow.position.y = -bodyRatio.armLength * 0.45;
    elbow.name = 'elbow';
    armGroup.add(elbow);
    
    // Lower arm
    const lowerArmGeometry = new THREE.CylinderGeometry(
      bodyRatio.armWidth * 0.45,
      bodyRatio.armWidth * 0.35,
      bodyRatio.armLength * 0.45,
      12
    );
    const lowerArm = new THREE.Mesh(lowerArmGeometry, skinMaterial);
    lowerArm.position.y = -bodyRatio.armLength * 0.675;
    lowerArm.castShadow = true;
    lowerArm.name = 'arm';
    armGroup.add(lowerArm);
    
    // Wrist
    const wristGeometry = new THREE.SphereGeometry(bodyRatio.armWidth * 0.35, 8, 8);
    const wrist = new THREE.Mesh(wristGeometry, skinMaterial);
    wrist.position.y = -bodyRatio.armLength * 0.9;
    wrist.name = 'wrist';
    armGroup.add(wrist);
    
    return armGroup;
  }

  private createLeg(skinMaterial: THREE.Material, shortsMaterial: THREE.Material, shoeMaterial: THREE.Material, side: 'left' | 'right'): THREE.Group {
    const legGroup = new THREE.Group();
    const { bodyRatio, features } = StyleGuide.realisticCharacter;
    
    // Upper leg (thigh)
    const thighGeometry = new THREE.CylinderGeometry(
      bodyRatio.legWidth * 0.7,
      bodyRatio.legWidth * 0.6,
      bodyRatio.legLength * 0.45,
      12
    );
    const thigh = new THREE.Mesh(thighGeometry, shortsMaterial);
    thigh.position.y = -bodyRatio.legLength * 0.225;
    thigh.castShadow = true;
    legGroup.add(thigh);
    
    // Knee
    const kneeGeometry = new THREE.SphereGeometry(bodyRatio.legWidth * 0.5, 8, 8);
    const knee = new THREE.Mesh(kneeGeometry, skinMaterial);
    knee.position.y = -bodyRatio.legLength * 0.45;
    knee.name = 'knee';
    legGroup.add(knee);
    
    // Lower leg (calf)
    const calfGeometry = new THREE.CylinderGeometry(
      bodyRatio.legWidth * 0.5,
      bodyRatio.legWidth * 0.35,
      bodyRatio.legLength * 0.5,
      12
    );
    
    // Add calf muscle bulge
    if (features.calfDefinition > 0) {
      const calfVertices = calfGeometry.attributes.position;
      for (let i = 0; i < calfVertices.count; i++) {
        const y = calfVertices.getY(i);
        const z = calfVertices.getZ(i);
        if (y > 0 && z < 0) {
          const bulge = 1 + features.calfDefinition * Math.sin((y + bodyRatio.legLength * 0.25) * Math.PI / (bodyRatio.legLength * 0.5));
          calfVertices.setZ(i, z * bulge);
        }
      }
      calfGeometry.attributes.position.needsUpdate = true;
    }
    
    const calf = new THREE.Mesh(calfGeometry, skinMaterial);
    calf.position.y = -bodyRatio.legLength * 0.7;
    calf.castShadow = true;
    calf.name = 'leg';
    legGroup.add(calf);
    
    // Ankle
    const ankleGeometry = new THREE.SphereGeometry(bodyRatio.legWidth * 0.35, 8, 8);
    ankleGeometry.scale(1, 0.7, 1);
    const ankle = new THREE.Mesh(ankleGeometry, skinMaterial);
    ankle.position.y = -bodyRatio.legLength * 0.95;
    ankle.name = 'ankle';
    legGroup.add(ankle);
    
    // Foot/Shoe
    const footGeometry = new THREE.BoxGeometry(
      bodyRatio.legWidth * 0.8,
      bodyRatio.legWidth * 0.4,
      features.footLength
    );
    const foot = new THREE.Mesh(footGeometry, shoeMaterial);
    foot.position.set(0, -bodyRatio.legLength - bodyRatio.legWidth * 0.2, features.footLength * 0.2);
    foot.castShadow = true;
    legGroup.add(foot);
    
    return legGroup;
  }

  private createHand(skinMaterial: THREE.Material, side: 'left' | 'right'): THREE.Group {
    const handGroup = new THREE.Group();
    const { features } = StyleGuide.realisticCharacter;
    
    // Palm
    const palmGeometry = new THREE.BoxGeometry(
      features.handLength * 0.4,
      features.handLength * 0.5,
      features.handLength * 0.15
    );
    const palm = new THREE.Mesh(palmGeometry, skinMaterial);
    palm.castShadow = true;
    palm.name = 'palm';
    handGroup.add(palm);
    
    // Fingers
    const fingerPositions = [
      { x: -features.handLength * 0.15, y: features.handLength * 0.2, name: 'pinky' },
      { x: -features.handLength * 0.05, y: features.handLength * 0.25, name: 'ring' },
      { x: features.handLength * 0.05, y: features.handLength * 0.25, name: 'middle' },
      { x: features.handLength * 0.15, y: features.handLength * 0.2, name: 'index' }
    ];
    
    fingerPositions.forEach((pos, index) => {
      const fingerLength = features.handLength * 0.3 * (1 - index * 0.05);
      const fingerGroup = new THREE.Group();
      
      // Three segments per finger
      for (let segment = 0; segment < features.fingerSegments; segment++) {
        const segmentLength = fingerLength / features.fingerSegments;
        const segmentGeometry = new THREE.CylinderGeometry(
          features.handLength * 0.03,
          features.handLength * 0.025,
          segmentLength,
          6
        );
        const segmentMesh = new THREE.Mesh(segmentGeometry, skinMaterial);
        segmentMesh.position.y = segment * segmentLength + segmentLength / 2;
        segmentMesh.castShadow = true;
        fingerGroup.add(segmentMesh);
        
        // Knuckle
        if (segment < features.fingerSegments - 1) {
          const knuckleGeometry = new THREE.SphereGeometry(features.handLength * 0.03, 6, 6);
          const knuckle = new THREE.Mesh(knuckleGeometry, skinMaterial);
          knuckle.position.y = (segment + 1) * segmentLength;
          fingerGroup.add(knuckle);
        }
      }
      
      fingerGroup.position.set(pos.x, pos.y, 0);
      fingerGroup.rotation.x = -0.1;
      handGroup.add(fingerGroup);
    });
    
    // Thumb
    const thumbGroup = new THREE.Group();
    const thumbLength = features.handLength * 0.25;
    
    for (let segment = 0; segment < 2; segment++) {
      const segmentLength = thumbLength / 2;
      const segmentGeometry = new THREE.CylinderGeometry(
        features.handLength * 0.035,
        features.handLength * 0.03,
        segmentLength,
        6
      );
      const segmentMesh = new THREE.Mesh(segmentGeometry, skinMaterial);
      segmentMesh.position.y = segment * segmentLength + segmentLength / 2;
      segmentMesh.castShadow = true;
      thumbGroup.add(segmentMesh);
    }
    
    thumbGroup.position.set(
      (side === 'left' ? -1 : 1) * features.handLength * 0.2,
      0,
      features.handLength * 0.05
    );
    thumbGroup.rotation.z = (side === 'left' ? -1 : 1) * 0.5;
    handGroup.add(thumbGroup);
    
    return handGroup;
  }

  private setupSkeleton(): THREE.Skeleton {
    // Create a basic skeleton for future animations
    const rootBone = new THREE.Bone();
    rootBone.position.y = 0;
    this.bones.push(rootBone);
    
    // Spine bones
    let previousBone = rootBone;
    for (let i = 0; i < StyleGuide.realisticCharacter.skeleton.spine; i++) {
      const spineBone = new THREE.Bone();
      spineBone.position.y = 0.4;
      previousBone.add(spineBone);
      this.bones.push(spineBone);
      previousBone = spineBone;
    }
    
    // Create skeleton
    const skeleton = new THREE.Skeleton(this.bones);
    return skeleton;
  }

  private setupIdleAnimation(): void {
    // Add subtle breathing animation
    const breathingSpeed = 0.001;
    const breathingAmount = 0.01;
    
    const animate = () => {
      const time = Date.now() * breathingSpeed;
      
      // Chest breathing
      if (this.bodyParts.torso) {
        this.bodyParts.torso.scale.x = 1 + Math.sin(time) * breathingAmount;
        this.bodyParts.torso.scale.z = 1 + Math.sin(time) * breathingAmount;
      }
      
      // Slight head bob
      if (this.bodyParts.head) {
        this.bodyParts.head.position.y = 1.5 + Math.sin(time * 0.5) * 0.005;
      }
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }

  public updateAnimation(state: string, params?: any): void {
    switch (state) {
      case 'idle':
        this.resetPose();
        break;
      case 'walk':
        this.animateWalk(params?.progress || 0);
        break;
      case 'jump':
        this.animateJump(params?.progress || 0);
        break;
      case 'attack':
        this.animateAttack(params?.type || 'punch', params?.progress || 0);
        break;
      case 'block':
        this.animateBlock();
        break;
      case 'hit':
        this.animateHit(params?.direction || 'front');
        break;
    }
  }

  private animateWalk(progress: number): void {
    const walkCycle = Math.sin(progress * Math.PI * 2);
    const { bodyRatio } = StyleGuide.realisticCharacter;
    
    // Leg movement
    this.bodyParts.leftLeg.rotation.x = walkCycle * 0.4;
    this.bodyParts.rightLeg.rotation.x = -walkCycle * 0.4;
    
    // Arm swing
    this.bodyParts.leftArm.rotation.x = -walkCycle * 0.2;
    this.bodyParts.rightArm.rotation.x = walkCycle * 0.2;
    
    // Body sway
    this.group.rotation.y = walkCycle * 0.05;
    
    // Slight bounce
    this.group.position.y = Math.abs(walkCycle) * 0.02;
  }

  private animateJump(progress: number): void {
    const jumpArc = Math.sin(progress * Math.PI);
    
    // Crouch at start, extend in air
    if (progress < 0.3) {
      // Crouch phase
      const crouch = progress / 0.3;
      this.bodyParts.leftLeg.rotation.x = crouch * 0.5;
      this.bodyParts.rightLeg.rotation.x = crouch * 0.5;
      this.group.scale.y = 1 - crouch * 0.1;
    } else {
      // Jump phase
      this.bodyParts.leftLeg.rotation.x = -0.3;
      this.bodyParts.rightLeg.rotation.x = -0.3;
      this.bodyParts.leftArm.rotation.z = -0.5;
      this.bodyParts.rightArm.rotation.z = 0.5;
      this.group.scale.y = 1.05;
    }
    
    this.group.position.y = jumpArc * 2;
  }

  private animateAttack(type: string, progress: number): void {
    const attackSpeed = Math.sin(progress * Math.PI);
    
    if (type === 'punch') {
      // Rotate and extend arm
      this.bodyParts.rightArm.rotation.x = -attackSpeed * 1.5;
      this.bodyParts.rightArm.rotation.y = attackSpeed * 0.3;
      
      // Body rotation for power
      this.bodyParts.torso.rotation.y = attackSpeed * 0.2;
      
      // Fist clenching (rotate hand)
      if (this.bodyParts.hands.right) {
        this.bodyParts.hands.right.rotation.x = -attackSpeed * 0.5;
      }
    } else if (type === 'kick') {
      // Leg extension
      this.bodyParts.rightLeg.rotation.x = -attackSpeed * 1.2;
      
      // Balance with arms
      this.bodyParts.leftArm.rotation.z = -attackSpeed * 0.3;
      this.bodyParts.rightArm.rotation.z = attackSpeed * 0.3;
      
      // Lean back slightly
      this.bodyParts.torso.rotation.x = attackSpeed * 0.1;
    }
  }

  private animateBlock(): void {
    // Defensive stance
    this.bodyParts.leftArm.rotation.x = -0.7;
    this.bodyParts.leftArm.rotation.y = 0.3;
    this.bodyParts.rightArm.rotation.x = -0.7;
    this.bodyParts.rightArm.rotation.y = -0.3;
    
    // Slight crouch
    this.bodyParts.leftLeg.rotation.x = 0.1;
    this.bodyParts.rightLeg.rotation.x = 0.1;
    this.group.scale.y = 0.95;
  }

  private animateHit(direction: string): void {
    // Recoil animation
    if (direction === 'front') {
      this.bodyParts.torso.rotation.x = 0.2;
      this.bodyParts.head.rotation.x = 0.3;
    } else {
      this.bodyParts.torso.rotation.x = -0.2;
      this.bodyParts.head.rotation.x = -0.3;
    }
    
    // Arms flail slightly
    this.bodyParts.leftArm.rotation.z = -0.2;
    this.bodyParts.rightArm.rotation.z = 0.2;
  }

  private resetPose(): void {
    // Reset all rotations and positions
    this.bodyParts.head.rotation.set(0, 0, 0);
    this.bodyParts.torso.rotation.set(0, 0, 0);
    this.bodyParts.leftArm.rotation.set(0, 0, 0);
    this.bodyParts.rightArm.rotation.set(0, 0, 0);
    this.bodyParts.leftLeg.rotation.set(0, 0, 0);
    this.bodyParts.rightLeg.rotation.set(0, 0, 0);
    this.group.scale.set(1, 1, 1);
    this.group.position.y = 0;
    this.group.rotation.y = 0;
  }

  public dispose(): void {
    this.group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (child.material instanceof THREE.Material) {
          child.material.dispose();
        }
      }
    });
  }
}