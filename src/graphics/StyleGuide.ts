/**
 * Street Fighter meets South Park Visual Style Guide
 * 
 * This defines the visual aesthetic for our street fighting fat kids game
 */

export const StyleGuide = {
  // Color Palette
  colors: {
    // Street/Urban colors
    asphalt: 0x2d2d2d,
    asphaltDark: 0x1a1a1a,
    concrete: 0x7a7a7a,
    sidewalk: 0x8a8a8a,
    graffiti: {
      red: 0xff1744,
      blue: 0x2979ff,
      green: 0x00e676,
      yellow: 0xffea00,
      purple: 0xd500f9
    },
    
    // Environment colors
    buildingBrick: 0x8b4513,
    buildingConcrete: 0x696969,
    rust: 0xb7410e,
    dirt: 0x654321,
    
    // Lighting colors
    streetLightWarm: 0xffd700,
    neonPink: 0xff1493,
    neonBlue: 0x00bfff,
    sunsetOrange: 0xff6347,
    duskSky: 0x483d8b,
    
    // Character colors
    skinTones: {
      pale: 0xfdbcb4,
      medium: 0xf4a460,
      tan: 0xd2691e,
      dark: 0x8b4513
    },
    clothing: {
      shirt1: 0xff0000,  // Red t-shirt
      shirt2: 0x1e90ff,  // Blue t-shirt
      jeans: 0x191970,
      shorts: 0x4169e1,
      shoes: 0x2f4f4f
    }
  },
  
  // Character Proportions (South Park inspired)
  character: {
    // Chubby kid proportions (less extreme)
    bodyRatio: {
      headSize: 0.3,       // Large head relative to body
      bodyWidth: 0.8,      // Chubby but not extremely wide
      bodyHeight: 1.1,     // Slightly taller torso
      armLength: 0.7,      // Short arms but not too stubby
      armWidth: 0.2,       // Slightly thick arms
      legLength: 0.6,      // Short legs
      legWidth: 0.25,      // Thick but not extreme
      bellySize: 1.1       // Small belly protrusion
    },
    
    // Visual features
    features: {
      eyeSize: 0.08,
      eyeSpacing: 0.15,
      mouthWidth: 0.2,
      earSize: 0.06,
      handSize: 0.15,
      footSize: 0.2
    }
  },
  
  // Realistic Human Proportions (for realistic mode)
  realisticCharacter: {
    // Realistic teenage fighter proportions
    bodyRatio: {
      headSize: 0.24,      // Realistic head size (1/7.5 of height)
      bodyWidth: 0.45,     // Athletic build
      bodyHeight: 1.2,     // Proper torso length
      armLength: 1.1,      // Full arm reach
      armWidth: 0.15,      // Muscular but not bulky
      legLength: 1.2,      // Proper leg proportions
      legWidth: 0.18,      // Athletic legs
      shoulderWidth: 0.5,  // Broad shoulders
      hipWidth: 0.35,      // Realistic hip width
      neckLength: 0.15,    // Proper neck
      waistWidth: 0.32     // Athletic waist
    },
    
    // Detailed features for realism
    features: {
      eyeSize: 0.03,       // Realistic eye size
      eyeSpacing: 0.065,   // One eye width apart
      pupilSize: 0.015,    // Detailed pupils
      irisSize: 0.02,      // Iris diameter
      noseLength: 0.05,    // Proper nose
      noseWidth: 0.035,    // Nose width
      mouthWidth: 0.08,    // Natural mouth
      lipThickness: 0.01,  // Lip detail
      earSize: 0.07,       // Realistic ears
      handLength: 0.19,    // From wrist to fingertips
      fingerSegments: 3,   // Finger joints
      footLength: 0.25,    // Realistic foot size
      
      // Face detail positions (relative to head center)
      eyeHeight: 0.0,      // Eyes at center
      noseHeight: -0.08,   // Below eyes
      mouthHeight: -0.15,  // Below nose
      earHeight: 0.0,      // Aligned with eyes
      
      // Body muscle definition
      pectoralDefinition: 0.03,
      abdominalRows: 3,    // Six-pack potential
      bicepBulge: 0.02,
      calfDefinition: 0.02
    },
    
    // Skeletal structure for proper deformation
    skeleton: {
      spine: 3,            // Spine segments
      fingerBones: 3,      // Per finger
      toeBones: 2,         // Per toe
      neckVertebrae: 2     // Neck flexibility
    }
  },
  
  // Environment Scale
  environment: {
    streetWidth: 20,
    streetDepth: 15,
    sidewalkHeight: 0.15,
    buildingHeight: 15,
    buildingDepth: 5,
    propScale: 1.2,  // Slightly oversized props for cartoon effect
    
    // Street details
    laneLineWidth: 0.1,
    laneLineLength: 2,
    laneLineGap: 1,
    curbHeight: 0.2,
    gutterWidth: 0.5
  },
  
  // Material Properties
  materials: {
    // Cartoon-style rendering
    cartoonOutline: {
      thickness: 0.02,
      color: 0x000000,
      alpha: 0.8
    },
    
    // Surface properties
    roughness: {
      asphalt: 0.9,
      concrete: 0.8,
      brick: 0.7,
      character: 0.6,
      metal: 0.3
    },
    
    metalness: {
      default: 0.0,
      trashCan: 0.7,
      streetSign: 0.8,
      car: 0.6
    },
    
    // Realistic material properties
    realistic: {
      skin: {
        roughness: 0.7,
        metalness: 0.0,
        subsurfaceIntensity: 0.15,
        clearcoat: 0.1,
        sheen: 0.3
      },
      fabric: {
        roughness: 0.85,
        metalness: 0.0,
        sheen: 0.2
      },
      leather: {
        roughness: 0.6,
        metalness: 0.1,
        clearcoat: 0.3
      },
      hair: {
        roughness: 0.65,
        metalness: 0.0,
        anisotropy: 0.8
      },
      eye: {
        roughness: 0.1,
        metalness: 0.0,
        transmission: 0.9,
        ior: 1.376,  // Index of refraction for cornea
        clearcoat: 1.0
      },
      teeth: {
        roughness: 0.2,
        metalness: 0.0,
        clearcoat: 0.5
      }
    }
  },
  
  // Lighting Setup
  lighting: {
    // Sunset/dusk atmosphere
    ambient: {
      color: 0x4a4a6a,
      intensity: 0.4
    },
    
    sun: {
      color: 0xff6b35,
      intensity: 0.6,
      position: { x: -10, y: 8, z: 5 }
    },
    
    streetLights: {
      color: 0xffd700,
      intensity: 2.0,
      distance: 8,
      decay: 2
    },
    
    neonSigns: {
      intensity: 1.5,
      emissiveIntensity: 2
    }
  },
  
  // Animation Style
  animation: {
    // Exaggerated movements
    walkBounce: 0.08,     // Bouncy walk cycle
    bellyJiggle: 0.02,    // Subtle belly physics
    impactSquash: 0.25,   // Squash on impact
    jumpSquash: 0.15,     // Squash before jump
    landingSquash: 0.3    // Squash on landing
  },
  
  // UI Style
  ui: {
    // Comic book/cartoon style
    borderRadius: '8px',
    borderWidth: '4px',
    shadowSize: '4px',
    
    colors: {
      healthBarRed: '#ff1744',
      healthBarYellow: '#ffea00',
      healthBarGreen: '#00e676',
      uiBorder: '#000000',
      uiBackground: 'rgba(0, 0, 0, 0.7)',
      textPrimary: '#ffffff',
      textShadow: '#000000'
    },
    
    fonts: {
      main: 'Comic Sans MS, cursive',
      fallback: 'Arial Black, sans-serif'
    }
  }
};

// Helper functions for style application
export const getHealthBarColor = (healthPercent: number): string => {
  if (healthPercent > 60) return StyleGuide.ui.colors.healthBarGreen;
  if (healthPercent > 30) return StyleGuide.ui.colors.healthBarYellow;
  return StyleGuide.ui.colors.healthBarRed;
};

export const getRandomGraffitiColor = (): number => {
  const colors = Object.values(StyleGuide.colors.graffiti);
  return colors[Math.floor(Math.random() * colors.length)];
};

export const getRandomSkinTone = (): number => {
  const tones = Object.values(StyleGuide.colors.skinTones);
  return tones[Math.floor(Math.random() * tones.length)];
};