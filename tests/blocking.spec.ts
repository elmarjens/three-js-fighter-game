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
    
    // With blocking, should take 5 damage instead of 10 (50% reduction)
    const expectedHealth = initialHealth - 5;
    expect(healthAfterBlockedAttack).toBe(expectedHealth);
  });

  test('blocking visual feedback', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    // Player 1 blocks
    await page.keyboard.down('b');
    await page.waitForTimeout(200);
    
    // Check if player has blocking visual (blue emissive)
    const isBlocking = await page.evaluate(() => {
      const game = (window as any).game;
      if (game && game.player1) {
        const material = game.player1.mesh.material;
        return material.emissive.getHex() === 0x0088ff;
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
});