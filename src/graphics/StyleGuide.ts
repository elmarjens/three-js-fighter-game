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