import { test, expect } from '@playwright/test';

test.describe('Instructor Journey', () => {
  // We use a single test for the full journey to ensure data continuity 
  // (the same user that is registered is the one performing the actions).
  test('should register, login, and create a course draft', async ({ page }) => {
    test.setTimeout(60000); // Give plenty of time for full journey
    const randomSuffix = Math.floor(Math.random() * 10000);
    const instructor = {
      email: `instructor_${randomSuffix}@edulearn.com`,
      password: 'Password123!',
      firstName: 'Master',
      lastName: 'Teacher',
      courseTitle: `E2E Masterclass ${randomSuffix}`
    };

    // 1. REGISTRATION
    await page.goto('/auth');
    await page.click('text=Register');
    await page.fill('input[name="firstName"]', instructor.firstName);
    await page.fill('input[name="lastName"]', instructor.lastName);
    await page.fill('input[name="email"]', instructor.email);
    await page.fill('input[name="password"]', instructor.password);
    
    await page.selectOption('select[name="role"]', 'INSTRUCTOR');
    await page.waitForTimeout(500); 

    await page.click('button:has-text("Create Account")');
    await expect(page.locator('.auth-success')).toBeVisible({ timeout: 10000 });

    // 2. LOGIN
    await page.click('text=Sign In'); // Switch to login tab
    await page.fill('input[name="email"]', instructor.email);
    await page.fill('input[name="password"]', instructor.password);
    
    await page.click('button.auth-submit:has-text("Sign In")');

    // FIX: Wait for a UNIQUE dashboard element (the green pill)
    // This confirms we are actually on the dashboard, not just seeing "Welcome back" on the login page.
    await page.waitForLoadState('networkidle');
    const dashboardPill = page.locator('.pill:has-text("Instructor dashboard")');
    await dashboardPill.waitFor({ state: 'visible', timeout: 15000 });
    
    await expect(page.locator('.page-title')).toContainText('Welcome back');

    // 3. COURSE CREATION
    await page.goto('/instructor/create-course');
    await page.waitForLoadState('networkidle');

    const titleInput = page.locator('input[placeholder="e.g. Modern Web Development"]');
    await titleInput.waitFor({ state: 'visible' });
    await titleInput.fill(instructor.courseTitle);

    await page.fill('textarea[placeholder="What will students learn?"]', 'Learning automated testing with Playwright.');
    await page.fill('input[placeholder="0 = Free"]', '49');

    // Save Draft
    await page.click('button:has-text("Save Draft")');

    // Verify Success
    await expect(page.locator('text=Course draft created successfully')).toBeVisible();
    await expect(page.locator('button:has-text("Submit for Review")')).toBeVisible();
    
    // 4. LESSON MANAGEMENT
    await page.click('button:has-text("+ Add Lesson")');
    await page.fill('input[placeholder="Lesson Title"]', 'Introduction to E2E Testing');
    await page.fill('textarea[placeholder="Lesson Description"]', 'An automated walk-through.');
    
    await page.click('button:has-text("Save Lesson")');
    await expect(page.locator('text=Saved')).toBeVisible();
  });
});
