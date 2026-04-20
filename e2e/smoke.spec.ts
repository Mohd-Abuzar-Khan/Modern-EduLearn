import { test, expect } from '@playwright/test';

test.describe('EduLearn Smoke Test', () => {
  test.beforeEach(async ({ page }) => {
    // Log console messages from the browser
    page.on('console', msg => console.log(`BROWSER CONSOLE: ${msg.text()}`));
  });

  test('should load the home page correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check brand mark
    await expect(page.locator('.brand-mark')).toContainText('EDULEARN');
    
    // Check hero heading
    await expect(page.locator('.hero-copy h1')).toContainText('Learn without boundaries');
    
    // Check navigation links
    await expect(page.locator('.landing-nav a:has-text("Courses")')).toBeVisible();
    await expect(page.locator('.landing-nav a:has-text("About")')).toBeVisible();
  });

  test('should navigate to Explore page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Courses');
    
    // Wait for navigation and potential network activity
    await page.waitForURL(/\/explore/);
    await page.waitForLoadState('networkidle');
    
    // FIX 2: Check the correct title selector for guest explore
    await expect(page.locator('.intro-title')).toBeVisible();
    await expect(page.locator('.intro-title')).toContainText('Find your learning journey');
  });
});
