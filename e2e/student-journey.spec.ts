import { test, expect } from '@playwright/test';

test.describe('Student Comprehensive Journey', () => {
  test('should complete registration, login, and course exploration', async ({ page }) => {
    test.setTimeout(60000); 
    
    const randomSuffix = Math.floor(Math.random() * 10000);
    const student = {
      email: `student_${randomSuffix}@edulearn.com`,
      password: 'Password123!',
      firstName: 'Curious',
      lastName: 'Student'
    };

    // 1. REGISTRATION
    await page.goto('/auth');
    await page.click('text=Register');
    await page.fill('input[name="firstName"]', student.firstName);
    await page.fill('input[name="lastName"]', student.lastName);
    await page.fill('input[name="email"]', student.email);
    await page.fill('input[name="password"]', student.password);
    await page.selectOption('select[name="role"]', 'STUDENT');
    await page.waitForTimeout(500); 

    await page.click('button:has-text("Create Account")');
    await expect(page.locator('.auth-success')).toBeVisible({ timeout: 15000 });

    // 2. LOGIN
    await page.click('text=Sign In');
    await page.fill('input[name="email"]', student.email);
    await page.fill('input[name="password"]', student.password);
    await page.click('button.auth-submit:has-text("Sign In")');

    // Wait for the unique Student Dashboard Pill
    await page.waitForLoadState('networkidle');
    const dashboardPill = page.locator('.pill:has-text("Student dashboard")');
    await dashboardPill.waitFor({ state: 'visible', timeout: 20000 });
    await expect(page.locator('.page-title')).toContainText('Welcome back');

    // 3. EXPLORE COURSES
    await page.goto('/student/explore');
    await page.waitForLoadState('networkidle');
    
    // Check if course cards are visible
    const firstCourse = page.locator('.explore-card').first();
    await firstCourse.waitFor({ state: 'visible', timeout: 15000 });
    
    const courseTitle = await firstCourse.locator('.course-title').textContent();
    console.log(`Verified course visibility: ${courseTitle}`);
    
    // 4. VIEW COURSE DETAILS
    await firstCourse.click();
    await page.waitForURL(/\/course\//);
    
    // Verify we reached the details page
    await expect(page.locator('.lesson-title')).toBeVisible();
    await expect(page.locator('button:has-text("Enroll Now")')).toBeInViewport();
    
    console.log('Journey successful up to Enrollment. (Payment skipped as requested)');
  });
});
