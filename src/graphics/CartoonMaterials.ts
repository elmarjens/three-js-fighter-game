import * as THREE from 'three';

export class CartoonMaterials {
  // Custom shader for cel-shading effect
  static celShadingVertexShader = `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    void main() {
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      vNormal = normalMatrix * normal;
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  static celShadingFragmentShader = `
    uniform vec3 uColor;
    uniform vec3 uLightPosition;
    uniform float uShadowIntensity;
    
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    
    void main() {
      vec3 normal = normalize(vNormal);
      vec3 lightDirection = normalize(uLightPosition);
      
      // Calculate basic lighting
      float intensity = dot(normal, lightDirection);
      
      // Quantize the intensity for cel-shading steps
      float celShaded;
      if (intensity > 0.95) {
        celShaded = 1.0;
      } else if (intensity > 0.5) {
        celShaded = 0.8;
      } else if (intensity > 0.25) {
        celShaded = 0.6;
      } else {
        celShaded = 0.4;
      }
      
      // Apply shadow intensity
      celShaded = mix(celShaded, celShaded * uShadowIntensity, 1.0 - celShaded);
      
      // Calculate final color
      vec3 finalColor = uColor * celShaded;
      
      // Add rim lighting for cartoon effect
      vec3 viewDirection = normalize(vViewPosition);
      float rimLight = 1.0 - max(0.0, dot(viewDirection, normal));
      rimLight = pow(rimLight, 2.0) * 0.3;
      
      finalColor += vec3(rimLight);
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  // Create a toon material with stepped shading
  static createToonMaterial(color: number, emissive: number = 0x000000): THREE.MeshToonMaterial {
    const material = new THREE.MeshToonMaterial({
      color: color,
      emissive: emissive,
      emissiveIntensity: 0.1
    });
    
    // Create gradient map for toon shading
    const colors = new Uint8Array(4);
    for (let c = 0; c <= colors.length; c++) {
      colors[c] = (c / colors.length) * 256;
    }
    const gradientMap = new THREE.DataTexture(colors, colors.length, 1, THREE.RedFormat);
    gradientMap.needsUpdate = true;
    
    material.gradientMap = gradientMap;
    
    return material;
  }

  // Create custom cel-shaded material
  static createCelShadedMaterial(color: number): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(color) },
        uLightPosition: { value: new THREE.Vector3(5, 10, 5) },
        uShadowIntensity: { value: 0.5 }
      },
      vertexShader: this.celShadingVertexShader,
      fragmentShader: this.celShadingFragmentShader
    });
  }

  // Create outlined material for cartoon look
  static createOutlineMaterial(thickness: number = 0.02): THREE.ShaderMaterial {
    const outlineVertexShader = `
      uniform float thickness;
      
      void main() {
        vec3 newPosition = position + normal * thickness;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
      }
    `;

    const outlineFragmentShader = `
      uniform vec3 color;
      
      void main() {
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    return new THREE.ShaderMaterial({
      uniforms: {
        thickness: { value: thickness },
        color: { value: new THREE.Color(0x000000) }
      },
      vertexShader: outlineVertexShader,
      fragmentShader: outlineFragmentShader,
      side: THREE.BackSide
    });
  }

  // Update existing materials to toon style
  static convertToToonMaterial(mesh: THREE.Mesh): void {
    if (mesh.material instanceof THREE.MeshPhongMaterial || 
        mesh.material instanceof THREE.MeshStandardMaterial) {
      const oldMaterial = mesh.material as THREE.MeshPhongMaterial;
      mesh.material = this.createToonMaterial(
        oldMaterial.color.getHex(),
        oldMaterial.emissive ? oldMaterial.emissive.getHex() : 0x000000
      );
      oldMaterial.dispose();
    }
  }

  // Add outline to mesh
  static addOutlineToMesh(mesh: THREE.Mesh, parent: THREE.Group, thickness: number = 0.02): THREE.Mesh {
    const outlineMaterial = this.createOutlineMaterial(thickness);
    const outlineMesh = new THREE.Mesh(mesh.geometry, outlineMaterial);
    outlineMesh.position.copy(mesh.position);
    outlineMesh.rotation.copy(mesh.rotation);
    outlineMesh.scale.copy(mesh.scale);
    parent.add(outlineMesh);
    
    // Make outline render behind the main mesh
    outlineMesh.renderOrder = mesh.renderOrder - 1;
    
    return outlineMesh;
  }

  // Convert a group of meshes to cartoon style
  static applyCartoonStyle(group: THREE.Group, addOutlines: boolean = true): void {
    const outlines: THREE.Mesh[] = [];
    
    group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Convert material to toon
        this.convertToToonMaterial(child);
        
        // Add outline if requested
        if (addOutlines && child.geometry) {
          const outline = this.addOutlineToMesh(child, group, 0.015);
          outlines.push(outline);
        }
      }
    });
    
    // Store outlines reference for cleanup
    (group as any).outlines = outlines;
  }

  // Clean up outlines
  static removeOutlines(group: THREE.Group): void {
    const outlines = (group as any).outlines;
    if (outlines && Array.isArray(outlines)) {
      outlines.forEach((outline: THREE.Mesh) => {
        group.remove(outline);
        if (outline.material instanceof THREE.Material) {
          outline.material.dispose();
        }
      });
      delete (group as any).outlines;
    }
  }
}