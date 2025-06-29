import { test, expect } from '@playwright/test';

test.describe('Blocking Mechanics', () => {
  test('players can block attacks', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    // Position players close together
    await page.evaluate(() => {
      const game = (window as any).game;
      if (game) {
        game.player1.mesh.position.x = 0;
        game.player2.mesh.position.x = 1.5;
        game.player1.facingRight = true;
        game.player1.velocity.set(0, 0, 0);
        game.player2.velocity.set(0, 0, 0);
      }
    });
    
    await page.waitForTimeout(100);
    
    // Get initial health
    const initialHealth = await page.locator('#player2-health').evaluate(el => {
      return parseFloat(el.style.width);
    });
    
    // Player 2 blocks while Player 1 attacks
    await page.keyboard.down('l'); // Player 2 blocks
    await page.waitForTimeout(100);
    
    await page.keyboard.down('v'); // Player 1 attacks
    await page.waitForTimeout(100);
    await page.keyboard.up('v');
    await page.waitForTimeout(600);
    
    await page.keyboard.up('b'); // Release block
    
    // Check if damage was reduced
    const healthAfterBlockedAttack = await page.locator('#player2-health').evaluate(el => {
      return parseFloat(el.style.width);
    });
    
    // With full blocking, should take 0 damage when stamina is available
    expect(healthAfterBlockedAttack).toBe(initialHealth);
  });

  test('blocking visual feedback', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    // Player 1 blocks
    await page.keyboard.down('b');
    await page.waitForTimeout(200);
    
    // Check if player is in blocking state
    const isBlocking = await page.evaluate(() => {
      const game = (window as any).game;
      if (game && game.player1) {
        return game.player1.isBlocking;
      }
      return false;
    });
    
    expect(isBlocking).toBe(true);
    
    await page.keyboard.up('b');
  });

  test('cannot attack while blocking', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    // Player 1 blocks and tries to attack
    await page.keyboard.down('b'); // Block
    await page.waitForTimeout(100);
    await page.keyboard.down('v'); // Try to attack
    await page.waitForTimeout(100);
    
    // Check if player is NOT attacking
    const isAttacking = await page.evaluate(() => {
      const game = (window as any).game;
      return game?.player1?.isAttacking || false;
    });
    
    expect(isAttacking).toBe(false);
    
    await page.keyboard.up('b');
    await page.keyboard.up('v');
  });

  test('cannot move while blocking', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    // Get initial position
    const initialX = await page.evaluate(() => {
      const game = (window as any).game;
      return game?.player1?.mesh.position.x || 0;
    });
    
    // Block and try to move
    await page.keyboard.down('b'); // Block
    await page.keyboard.down('d'); // Try to move right
    await page.waitForTimeout(200);
    
    // Check if position hasn't changed significantly
    const finalX = await page.evaluate(() => {
      const game = (window as any).game;
      return game?.player1?.mesh.position.x || 0;
    });
    
    // Should barely move (only velocity decay)
    expect(Math.abs(finalX - initialX)).toBeLessThan(0.1);
    
    await page.keyboard.up('b');
    await page.keyboard.up('d');
  });

  test('blocking drains stamina', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    // Get initial stamina
    const initialStamina = await page.locator('#player1-stamina').evaluate(el => {
      return parseFloat(el.style.width);
    });
    expect(initialStamina).toBe(100);
    
    // Block for 1 second
    await page.keyboard.down('b');
    await page.waitForTimeout(1000);
    await page.keyboard.up('b');
    
    // Check stamina has decreased
    const staminaAfterBlocking = await page.locator('#player1-stamina').evaluate(el => {
      return parseFloat(el.style.width);
    });
    
    // Should have lost roughly 25 stamina (25 per second)
    expect(staminaAfterBlocking).toBeLessThan(initialStamina);
    expect(staminaAfterBlocking).toBeGreaterThan(70);
    expect(staminaAfterBlocking).toBeLessThan(80);
  });

  test('stamina regenerates when not blocking', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    // First drain some stamina by attacking
    await page.keyboard.down('v');
    await page.waitForTimeout(100);
    await page.keyboard.up('v');
    await page.waitForTimeout(100);
    
    const staminaAfterAction = await page.locator('#player1-stamina').evaluate(el => {
      return parseFloat(el.style.width);
    });
    
    // Should have lost stamina from attack
    expect(staminaAfterAction).toBeLessThan(100);
    
    // Wait for regeneration
    await page.waitForTimeout(1000);
    
    const staminaAfterRegen = await page.locator('#player1-stamina').evaluate(el => {
      return parseFloat(el.style.width);
    });
    
    // Should have regenerated some stamina (15 per second)
    expect(staminaAfterRegen).toBeGreaterThan(staminaAfterAction);
  });

  test('cannot block without stamina', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    // Drain all stamina first
    await page.evaluate(() => {
      const game = (window as any).game;
      if (game) {
        game.player1.stamina = 0;
      }
    });
    
    // Try to block
    await page.keyboard.down('b');
    await page.waitForTimeout(100);
    
    // Check if player is NOT blocking
    const isBlocking = await page.evaluate(() => {
      const game = (window as any).game;
      return game?.player1?.isBlocking || false;
    });
    
    expect(isBlocking).toBe(false);
    
    await page.keyboard.up('b');
  });
});