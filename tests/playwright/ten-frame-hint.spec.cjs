/**
 * Ten-Frame Hint Button Test Suite
 * Tests the "Show hint" button feature for the ten-frame component
 */

const { chromium } = require('playwright');

// Parameterized URL
const TARGET_URL = 'http://localhost:5173/math-streak/';

// Test configuration
const TEST_TIMEOUT = 10000;

// Helper: Parse problem and calculate answer
function parseAndCalculate(problemText) {
  // Example: "3 + 4 = ?" -> answer is 7
  const match = problemText.match(/(\d+)\s*\+\s*(\d+)\s*=\s*\?/);
  if (match) {
    return parseInt(match[1], 10) + parseInt(match[2], 10);
  }
  throw new Error(`Unable to parse problem: ${problemText}`);
}

// Helper: Input number via number pad clicks
async function inputNumberViaClick(page, number) {
  const digits = String(number).split('');
  for (const digit of digits) {
    await page.click(`[data-testid="number-${digit}"]`);
    await page.waitForTimeout(100);
  }
}

// Test results tracking
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  criticalFailures: [],
  passedTests: [],
};

// Test runner
async function runTest(name, testFn, isCritical = true) {
  results.total++;
  console.log(`\n🧪 Running: ${name}`);

  try {
    await testFn();
    results.passed++;
    results.passedTests.push(name);
    console.log(`✅ PASSED: ${name}`);
    return true;
  } catch (error) {
    results.failed++;
    const failure = {
      test: name,
      error: error.message,
      critical: isCritical,
    };

    if (isCritical) {
      results.criticalFailures.push(failure);
      console.log(`❌ CRITICAL FAILURE: ${name}`);
    }
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

// Main test execution
(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 50,
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('='.repeat(80));
  console.log('TEN-FRAME HINT BUTTON TEST SUITE');
  console.log('='.repeat(80));

  try {
    // Navigate to the application
    console.log(`\n📍 Navigating to ${TARGET_URL}`);
    await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
    console.log('✅ Page loaded successfully');

    // Test 1: Verify "Show hint" button appears initially
    await runTest('Show hint button appears on initial load', async () => {
      const hintButton = page.locator('button:has-text("Show hint")');
      await hintButton.waitFor({ state: 'visible', timeout: TEST_TIMEOUT });

      const count = await hintButton.count();
      if (count !== 1) {
        throw new Error(`Expected 1 "Show hint" button, found ${count}`);
      }
    });

    // Test 2: Verify ten-frame is NOT visible initially
    await runTest('Ten-frame is hidden by default', async () => {
      // The ten-frame has role="img" when visible
      const tenFrame = page.locator('[role="img"][aria-label*="Ten frame"]');
      const isVisible = await tenFrame.isVisible().catch(() => false);

      if (isVisible) {
        throw new Error('Ten-frame should be hidden by default');
      }
    });

    // Test 3: Clicking "Show hint" button reveals the ten-frame
    await runTest('Clicking "Show hint" button reveals ten-frame', async () => {
      const hintButton = page.locator('button:has-text("Show hint")');
      await hintButton.click();

      // Wait for ten-frame to appear
      const tenFrame = page.locator('[role="img"][aria-label*="Ten frame"]');
      await tenFrame.waitFor({ state: 'visible', timeout: TEST_TIMEOUT });

      // Verify button is now hidden
      const buttonVisible = await hintButton.isVisible().catch(() => false);
      if (buttonVisible) {
        throw new Error('Show hint button should be hidden after clicking');
      }
    });

    // Test 4: New problem hides ten-frame and shows button again
    await runTest('New problem resets hint button state', async () => {
      // Get current problem
      const problemElement = page.locator('[data-testid="problem-display"]');
      const currentProblem = await problemElement.textContent();
      const answer = parseAndCalculate(currentProblem);

      // Answer the problem correctly to get a new one
      await inputNumberViaClick(page, answer);
      await page.click('[data-testid="submit-button"]');

      // Wait for feedback modal to appear
      await page.waitForSelector('[data-testid="feedback-modal"]', { timeout: TEST_TIMEOUT });

      // Wait for auto-advance (1500ms + buffer)
      await page.waitForTimeout(2000);

      // Verify new problem has appeared
      const newProblem = await problemElement.textContent();
      if (newProblem === currentProblem) {
        throw new Error('Problem did not change after correct answer');
      }

      // Verify hint button is visible again
      const hintButton = page.locator('button:has-text("Show hint")');
      await hintButton.waitFor({ state: 'visible', timeout: TEST_TIMEOUT });

      // Verify ten-frame is hidden again
      const tenFrame = page.locator('[role="img"][aria-label*="Ten frame"]');
      const isVisible = await tenFrame.isVisible().catch(() => false);
      if (isVisible) {
        throw new Error('Ten-frame should be hidden for new problem');
      }
    });

    // Test 5: Button is keyboard accessible
    await runTest('Hint button is keyboard accessible (focusable)', async () => {
      const hintButton = page.locator('button:has-text("Show hint")');

      // Focus the button via tab navigation
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Check if hint button can receive focus
      const isFocusable = await hintButton.evaluate(el => {
        const tabIndex = el.getAttribute('tabindex');
        return tabIndex === null || parseInt(tabIndex) >= 0;
      });

      if (!isFocusable) {
        throw new Error('Hint button should be keyboard focusable');
      }
    });

    // Test 6: Button can be activated with keyboard (Enter/Space)
    await runTest('Hint button can be activated with Enter key', async () => {
      // Ensure we're starting fresh
      await page.reload({ waitUntil: 'networkidle' });

      const hintButton = page.locator('button:has-text("Show hint")');
      await hintButton.waitFor({ state: 'visible', timeout: TEST_TIMEOUT });

      // Focus the button
      await hintButton.focus();

      // Activate with Enter key
      await page.keyboard.press('Enter');

      // Verify ten-frame appears
      const tenFrame = page.locator('[role="img"][aria-label*="Ten frame"]');
      await tenFrame.waitFor({ state: 'visible', timeout: TEST_TIMEOUT });
    });

    // Test 7: Button can be activated with Space key
    await runTest('Hint button can be activated with Space key', async () => {
      // Get current problem and answer it to get a new one
      const problemElement = page.locator('[data-testid="problem-display"]');
      const currentProblem = await problemElement.textContent();
      const answer = parseAndCalculate(currentProblem);

      await inputNumberViaClick(page, answer);
      await page.click('[data-testid="submit-button"]');
      await page.waitForTimeout(2000); // Wait for auto-advance

      // Now test Space key activation
      const hintButton = page.locator('button:has-text("Show hint")');
      await hintButton.waitFor({ state: 'visible', timeout: TEST_TIMEOUT });
      await hintButton.focus();

      // Activate with Space key
      await page.keyboard.press('Space');

      // Verify ten-frame appears
      const tenFrame = page.locator('[role="img"][aria-label*="Ten frame"]');
      await tenFrame.waitFor({ state: 'visible', timeout: TEST_TIMEOUT });
    });

    // Test 8: Button has proper ARIA label
    await runTest('Hint button has proper ARIA label for screen readers', async () => {
      // Reload to get fresh state
      await page.reload({ waitUntil: 'networkidle' });

      const hintButton = page.locator('button:has-text("Show hint")');
      await hintButton.waitFor({ state: 'visible', timeout: TEST_TIMEOUT });

      const ariaLabel = await hintButton.getAttribute('aria-label');
      if (!ariaLabel || !ariaLabel.toLowerCase().includes('hint')) {
        throw new Error(`Button should have descriptive aria-label, got: "${ariaLabel}"`);
      }
    });

    // Test 9: Button type is "button" (not "submit")
    await runTest('Hint button has correct type attribute', async () => {
      const hintButton = page.locator('button:has-text("Show hint")');
      const buttonType = await hintButton.getAttribute('type');

      if (buttonType !== 'button') {
        throw new Error(`Button type should be "button", got: "${buttonType}"`);
      }
    });

    // Test 10: Ten-frame displays correct ARIA label when visible
    await runTest('Ten-frame has descriptive ARIA label when visible', async () => {
      const hintButton = page.locator('button:has-text("Show hint")');
      await hintButton.click();

      const tenFrame = page.locator('[role="img"]');
      await tenFrame.waitFor({ state: 'visible', timeout: TEST_TIMEOUT });

      const ariaLabel = await tenFrame.getAttribute('aria-label');
      if (!ariaLabel || !ariaLabel.toLowerCase().includes('ten frame')) {
        throw new Error(`Ten-frame should have descriptive aria-label, got: "${ariaLabel}"`);
      }
    });

    // Test 11: Visual regression - Take screenshot of button
    await runTest('Visual check: Hint button appearance', async () => {
      await page.reload({ waitUntil: 'networkidle' });

      const hintButton = page.locator('button:has-text("Show hint")');
      await hintButton.waitFor({ state: 'visible', timeout: TEST_TIMEOUT });

      await page.screenshot({
        path: '/Users/atro/source/personal/jonah/math-streak/tests/artifacts/ten-frame-hint-button.png',
        fullPage: false,
      });

      console.log('   📸 Screenshot saved to tests/artifacts/ten-frame-hint-button.png');
    });

    // Test 12: Visual regression - Take screenshot of revealed ten-frame
    await runTest('Visual check: Revealed ten-frame appearance', async () => {
      const hintButton = page.locator('button:has-text("Show hint")');
      await hintButton.click();

      await page.waitForTimeout(500); // Wait for any transitions

      await page.screenshot({
        path: '/Users/atro/source/personal/jonah/math-streak/tests/artifacts/ten-frame-revealed.png',
        fullPage: false,
      });

      console.log('   📸 Screenshot saved to tests/artifacts/ten-frame-revealed.png');
    });

  } catch (error) {
    console.error('\n💥 Fatal error during test execution:', error);
    results.failed++;
    results.criticalFailures.push({
      test: 'Test Suite Execution',
      error: error.message,
      critical: true,
    });
  } finally {
    await browser.close();

    // Print summary
    console.log('\n' + '='.repeat(80));
    console.log('TEST SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total Tests: ${results.total}`);
    console.log(`Passed: ${results.passed} ✅`);
    console.log(`Failed: ${results.failed} ❌`);
    console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);

    if (results.criticalFailures.length > 0) {
      console.log('\n❌ CRITICAL FAILURES:');
      results.criticalFailures.forEach((failure, index) => {
        console.log(`${index + 1}. ${failure.test}`);
        console.log(`   Error: ${failure.error}`);
      });
    }

    if (results.passed === results.total) {
      console.log('\n🎉 ALL TESTS PASSED!');
      console.log('✅ Ten-frame hint button feature is working correctly');
      process.exit(0);
    } else {
      console.log('\n⚠️  SOME TESTS FAILED');
      console.log('Please review the failures above and fix the issues.');
      process.exit(1);
    }
  }
})();
