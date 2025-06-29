export interface PlayerInput {
  left: boolean;
  right: boolean;
  jump: boolean;
  punch: boolean;
}

export class InputManager {
  private keys: { [key: string]: boolean } = {};
  
  public player1Input: PlayerInput = {
    left: false,
    right: false,
    jump: false,
    punch: false
  };

  public player2Input: PlayerInput = {
    left: false,
    right: false,
    jump: false,
    punch: false
  };

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key.toLowerCase()] = true;
      this.updateInputs();
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key.toLowerCase()] = false;
      this.updateInputs();
    });
  }

  private updateInputs(): void {
    this.player1Input.left = this.keys['a'] || false;
    this.player1Input.right = this.keys['d'] || false;
    this.player1Input.jump = this.keys[' '] || false;
    this.player1Input.punch = this.keys['j'] || false;

    this.player2Input.left = this.keys['arrowleft'] || false;
    this.player2Input.right = this.keys['arrowright'] || false;
    this.player2Input.jump = this.keys['arrowup'] || false;
    this.player2Input.punch = this.keys['1'] || false;
  }
}