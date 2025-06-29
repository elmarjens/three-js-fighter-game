export interface PlayerInput {
  left: boolean;
  right: boolean;
  jump: boolean;
  punch: boolean;
  block: boolean;
}

export class InputManager {
  private keys: { [key: string]: boolean } = {};
  
  public player1Input: PlayerInput = {
    left: false,
    right: false,
    jump: false,
    punch: false,
    block: false
  };

  public player2Input: PlayerInput = {
    left: false,
    right: false,
    jump: false,
    punch: false,
    block: false
  };

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      
      // Handle controls toggle
      if (key === 'h') {
        this.toggleControls();
        return;
      }
      
      this.keys[key] = true;
      this.updateInputs();
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
      this.updateInputs();
    });
  }
  
  private toggleControls(): void {
    const controlsDisplay = document.getElementById('controls-display');
    if (controlsDisplay) {
      controlsDisplay.style.display = controlsDisplay.style.display === 'none' ? 'flex' : 'none';
    }
  }

  private updateInputs(): void {
    this.player1Input.left = this.keys['a'] || false;
    this.player1Input.right = this.keys['d'] || false;
    this.player1Input.jump = this.keys['w'] || false;
    this.player1Input.punch = this.keys['v'] || false;
    this.player1Input.block = this.keys['b'] || false;

    this.player2Input.left = this.keys['arrowleft'] || false;
    this.player2Input.right = this.keys['arrowright'] || false;
    this.player2Input.jump = this.keys['arrowup'] || false;
    this.player2Input.punch = this.keys['k'] || false;
    this.player2Input.block = this.keys['l'] || false;
  }
}