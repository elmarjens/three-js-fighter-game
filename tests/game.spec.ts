import { test, expect } from '@playwright/test';

test.describe('Fighter Game', () => {
  test('should load the game', async ({ page }) => {
    await page.goto('/');
    
    // Check if the canvas is present
    const canvas = await page.locator('canvas');
    await expect(canvas).toBeVisible();
    
    // Check if health bars are visible
    await expect(page.locator('#player1-health')).toBeVisible();
    await expect(page.locator('#player2-health')).toBeVisible();
    
    // Check player names
    await expect(page.locator('.player-name').first()).toHaveText('Player 1');
    await expect(page.locator('.player-name').last()).toHaveText('Player 2');
  });

  test('player 1 can move left and right', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000); // Wait for game to initialize
    
    // Take initial screenshot
    await page.screenshot({ path: 'tests/screenshots/initial.png' });
    
    // Move player 1 right
    await page.keyboard.down('d');
    await page.waitForTimeout(500);
    await page.keyboard.up('d');
    await page.screenshot({ path: 'tests/screenshots/player1-moved-right.png' });
    
    // Move player 1 left
    await page.keyboard.down('a');
    await page.waitForTimeout(500);
    await page.keyboard.up('a');
    await page.screenshot({ path: 'tests/screenshots/player1-moved-left.png' });
  });

  test('player 1 can jump', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    // Jump
    await page.keyboard.press(' ');
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'tests/screenshots/player1-jumping.png' });
  });

  test('players can attack each other', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    // Move player 1 right to get closer to player 2
    await page.keyboard.down('d');
    await page.waitForTimeout(1500); // Move for longer
    await page.keyboard.up('d');
    
    // Move player 2 left to get even closer
    await page.keyboard.down('ArrowLeft');
    await page.waitForTimeout(500);
    await page.keyboard.up('ArrowLeft');
    
    // Take screenshot before attack
    await page.screenshot({ path: 'tests/screenshots/before-attack.png' });
    
    // Player 1 attacks
    await page.keyboard.press('j');
    await page.waitForTimeout(700); // Wait for attack animation
    
    // Take screenshot after attack
    await page.screenshot({ path: 'tests/screenshots/after-attack.png' });
    
    // Check if player 2's health decreased
    const player2Health = await page.locator('#player2-health').evaluate(el => {
      return el.style.width;
    });
    console.log('Player 2 health after attack:', player2Health);
    expect(player2Health).not.toBe('100%');
  });

  test('game over when health reaches zero', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    // Move players very close together
    await page.keyboard.down('d');
    await page.waitForTimeout(1500);
    await page.keyboard.up('d');
    
    await page.keyboard.down('ArrowLeft');
    await page.waitForTimeout(800);
    await page.keyboard.up('ArrowLeft');
    
    // Attack multiple times to defeat player 2 (100 health / 10 damage = 10 attacks)
    for (let i = 0; i < 11; i++) { // Extra attack to ensure defeat
      await page.keyboard.press('j');
      await page.waitForTimeout(700); // Wait for cooldown
      
      // Log health for debugging
      const health = await page.locator('#player2-health').evaluate(el => el.style.width);
      console.log(`Attack ${i + 1}: Player 2 health = ${health}`);
    }
    
    // Check if game over message appears
    const gameMessage = page.locator('#game-message');
    await expect(gameMessage).toBeVisible();
    await expect(gameMessage).toContainText('Player 1 Wins!');
  });

  test('game can be restarted', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    // Move players close together
    await page.keyboard.down('d');
    await page.waitForTimeout(1500);
    await page.keyboard.up('d');
    
    await page.keyboard.down('ArrowLeft');
    await page.waitForTimeout(800);
    await page.keyboard.up('ArrowLeft');
    
    // Defeat player 2
    for (let i = 0; i < 11; i++) {
      await page.keyboard.press('j');
      await page.waitForTimeout(700);
    }
    
    // Wait for game over message and restart prompt
    await page.waitForTimeout(1500);
    
    // Press R to restart
    await page.keyboard.press('r');
    await page.waitForTimeout(500);
    
    // Check if game restarted
    const gameMessage = page.locator('#game-message');
    await expect(gameMessage).not.toBeVisible();
    
    // Check if health bars are reset
    const player1Health = await page.locator('#player1-health').evaluate(el => el.style.width);
    const player2Health = await page.locator('#player2-health').evaluate(el => el.style.width);
    expect(player1Health).toBe('100%');
    expect(player2Health).toBe('100%');
  });

  test('player 2 controls work', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    // Move player 2 left
    await page.keyboard.down('ArrowLeft');
    await page.waitForTimeout(500);
    await page.keyboard.up('ArrowLeft');
    
    // Move player 2 right
    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(500);
    await page.keyboard.up('ArrowRight');
    
    // Player 2 jump
    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(300);
    
    // Player 2 attack
    await page.keyboard.press('1');
    await page.screenshot({ path: 'tests/screenshots/player2-controls.png' });
  });
});