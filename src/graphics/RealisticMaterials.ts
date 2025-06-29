import * as THREE from 'three';

export class RealisticMaterials {
  // Subsurface scattering approximation for skin
  static skinVertexShader = `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec2 vUv;
    
    void main() {
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      vNormal = normalMatrix * normal;
      vUv = uv;
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  static skinFragmentShader = `
    uniform vec3 uSkinColor;
    uniform vec3 uSubsurfaceColor;
    uniform float uRoughness;
    uniform float uSubsurfaceIntensity;
    uniform sampler2D uNormalMap;
    uniform float uNormalScale;
    
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec2 vUv;
    
    vec3 lighting(vec3 normal, vec3 viewDir) {
      vec3 lightDir = normalize(vec3(5.0, 10.0, 5.0));
      vec3 halfwayDir = normalize(lightDir + viewDir);
      
      // Diffuse
      float diff = max(dot(normal, lightDir), 0.0);
      
      // Specular
      float spec = pow(max(dot(normal, halfwayDir), 0.0), 32.0);
      
      // Subsurface approximation
      float subsurface = pow(1.0 - diff, 2.0) * uSubsurfaceIntensity;
      
      return vec3(diff + spec * (1.0 - uRoughness) + subsurface);
    }
    
    void main() {
      vec3 normal = normalize(vNormal);
      
      // Apply normal map if available
      #ifdef USE_NORMALMAP
        vec3 normalTex = texture2D(uNormalMap, vUv).xyz * 2.0 - 1.0;
        normalTex.xy *= uNormalScale;
        normal = normalize(normal + normalTex);
      #endif
      
      vec3 viewDir = normalize(vViewPosition);
      vec3 lightFactors = lighting(normal, viewDir);
      
      // Mix skin color with subsurface color based on lighting
      vec3 finalColor = mix(uSubsurfaceColor, uSkinColor, lightFactors.x);
      finalColor *= lightFactors;
      
      // Add fresnel effect for realism
      float fresnel = pow(1.0 - dot(viewDir, normal), 3.0);
      finalColor += vec3(fresnel * 0.1);
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  // Create realistic skin material with subsurface scattering approximation
  static createSkinMaterial(skinTone: number, options?: {
    roughness?: number;
    subsurfaceIntensity?: number;
    normalMap?: THREE.Texture;
  }): THREE.MeshStandardMaterial {
    const skinColor = new THREE.Color(skinTone);
    
    // Calculate subsurface color (slightly redder and darker)
    const subsurfaceColor = skinColor.clone();
    subsurfaceColor.r *= 0.7;
    subsurfaceColor.g *= 0.5;
    subsurfaceColor.b *= 0.5;
    
    const material = new THREE.MeshStandardMaterial({
      color: skinColor,
      roughness: options?.roughness || 0.7,
      metalness: 0.0,
      normalMap: options?.normalMap,
      normalScale: new THREE.Vector2(0.5, 0.5)
    });
    
    // Enable subsurface scattering approximation
    material.emissive = subsurfaceColor;
    material.emissiveIntensity = options?.subsurfaceIntensity || 0.15;
    
    return material;
  }

  // Create realistic fabric material with proper roughness and texture
  static createFabricMaterial(color: number, options?: {
    roughness?: number;
    normalMap?: THREE.Texture;
    aoMap?: THREE.Texture;
  }): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: color,
      roughness: options?.roughness || 0.85,
      metalness: 0.0,
      normalMap: options?.normalMap,
      aoMap: options?.aoMap
    });
  }

  // Create leather/synthetic material for shoes
  static createLeatherMaterial(color: number): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.6,
      metalness: 0.1
    });
  }

  // Create eye material with proper reflectivity
  static createEyeMaterial(irisColor: number): THREE.MeshPhysicalMaterial {
    return new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.1,
      metalness: 0.0,
      transmission: 0.9,
      thickness: 0.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.0
    });
  }

  // Create hair material with anisotropic properties
  static createHairMaterial(color: number, style: 'straight' | 'curly' | 'messy'): THREE.MeshStandardMaterial {
    const roughness = style === 'straight' ? 0.4 : style === 'curly' ? 0.6 : 0.7;
    
    return new THREE.MeshStandardMaterial({
      color: color,
      roughness: roughness,
      metalness: 0.0
    });
  }

  // Create metal material for accessories
  static createMetalMaterial(color: number, roughness: number = 0.3): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: color,
      roughness: roughness,
      metalness: 0.95
    });
  }

  // Generate procedural normal maps for detail
  static generateSkinNormalMap(width: number = 512, height: number = 512): THREE.DataTexture {
    const size = width * height;
    const data = new Uint8Array(size * 4);
    
    // Generate subtle skin bumps
    for (let i = 0; i < size; i++) {
      const x = (i % width) / width;
      const y = Math.floor(i / width) / height;
      
      // Create noise pattern for pores
      const noise = Math.sin(x * 200) * Math.cos(y * 200) * 0.1;
      
      // Convert to normal map values
      data[i * 4] = 128 + noise * 127; // R (X)
      data[i * 4 + 1] = 128 + noise * 127; // G (Y)
      data[i * 4 + 2] = 255; // B (Z)
      data[i * 4 + 3] = 255; // A
    }
    
    const texture = new THREE.DataTexture(data, width, height);
    texture.needsUpdate = true;
    return texture;
  }

  // Create custom shader material for advanced skin rendering
  static createAdvancedSkinMaterial(skinTone: number): THREE.ShaderMaterial {
    const skinColor = new THREE.Color(skinTone);
    const subsurfaceColor = skinColor.clone();
    subsurfaceColor.r *= 0.7;
    subsurfaceColor.g *= 0.5;
    subsurfaceColor.b *= 0.5;
    
    return new THREE.ShaderMaterial({
      uniforms: {
        uSkinColor: { value: skinColor },
        uSubsurfaceColor: { value: subsurfaceColor },
        uRoughness: { value: 0.7 },
        uSubsurfaceIntensity: { value: 0.3 },
        uNormalMap: { value: this.generateSkinNormalMap() },
        uNormalScale: { value: 0.5 }
      },
      vertexShader: this.skinVertexShader,
      fragmentShader: this.skinFragmentShader,
      lights: true
    });
  }

  // Update existing cartoon materials to realistic
  static convertToRealisticMaterial(mesh: THREE.Mesh, materialType: 'skin' | 'fabric' | 'leather' | 'hair'): void {
    const oldMaterial = mesh.material as THREE.MeshToonMaterial;
    const color = oldMaterial.color.getHex();
    
    switch (materialType) {
      case 'skin':
        mesh.material = this.createSkinMaterial(color);
        break;
      case 'fabric':
        mesh.material = this.createFabricMaterial(color);
        break;
      case 'leather':
        mesh.material = this.createLeatherMaterial(color);
        break;
      case 'hair':
        mesh.material = this.createHairMaterial(color, 'messy');
        break;
    }
    
    oldMaterial.dispose();
  }

  // Apply realistic materials to character group
  static applyRealisticMaterials(characterGroup: THREE.Group): void {
    characterGroup.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const material = child.material as THREE.Material;
        
        // Determine material type based on mesh properties or naming
        if (child.name.includes('skin') || child.name.includes('head') || child.name.includes('arm') || child.name.includes('leg')) {
          this.convertToRealisticMaterial(child, 'skin');
        } else if (child.name.includes('shirt') || child.name.includes('pants') || child.name.includes('shorts')) {
          this.convertToRealisticMaterial(child, 'fabric');
        } else if (child.name.includes('shoe') || child.name.includes('foot')) {
          this.convertToRealisticMaterial(child, 'leather');
        } else if (child.name.includes('hair') || child.name.includes('cap')) {
          this.convertToRealisticMaterial(child, 'hair');
        }
      }
    });
  }
}