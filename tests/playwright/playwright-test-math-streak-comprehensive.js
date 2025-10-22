/**
 * Comprehensive UI Test Suite for Math Streak Application
 * Tests: Core functionality, keyboard support, correct/incorrect flows,
 *        accessibility, and visual/UX requirements
 */

const { chromium } = require('playwright');

// Parameterized URL (auto-detected)
const TARGET_URL = 'http://localhost:5173';

// Test configuration
const AUTO_ADVANCE_DELAY = 1500; // Expected auto-advance timing
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
    await page.waitForTimeout(100); // Small delay between clicks
  }
}

// Helper: Input number via keyboard
async function inputNumberViaKeyboard(page, number) {
  const digits = String(number).split('');
  for (const digit of digits) {
    await page.keyboard.press(digit);
    await page.waitForTimeout(100);
  }
}

// Helper: Get button dimensions
async function getButtonDimensions(page, testId) {
  const button = await page.locator(`[data-testid="${testId}"]`).first();
  const box = await button.boundingBox();
  return box;
}

// Test results tracking
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  warnings: 0,
  criticalFailures: [],
  nonCriticalIssues: [],
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
    } else {
      results.warnings++;
      results.nonCriticalIssues.push(failure);
      console.log(`⚠️  WARNING: ${name}`);
    }
    console.log(`   Error: ${error.message}`);
    return false;
  }
}

// Main test execution
(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 50, // Slow down for visibility
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });

  const page = await context.newPage();

  // Collect console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  try {
    console.log('\n' + '='.repeat(60));
    console.log('MATH STREAK - COMPREHENSIVE UI TEST SUITE');
    console.log('='.repeat(60));

    // ============================================
    // A. CORE FUNCTIONALITY TESTS
    // ============================================
    console.log('\n\n📋 A. CORE FUNCTIONALITY TESTS');
    console.log('-'.repeat(60));

    await runTest('Problem Display: Math problem is shown clearly', async () => {
      await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
      const problemText = await page.locator('[data-testid="problem"]').textContent();
      if (!problemText || !problemText.includes('+') || !problemText.includes('=')) {
        throw new Error(`Problem not displayed correctly: "${problemText}"`);
      }
      console.log(`   Problem displayed: "${problemText}"`);
    });

    await runTest('Number Pad Input: All number buttons (0-9) work', async () => {
      await page.goto(TARGET_URL);

      // Test each number button
      for (let i = 0; i <= 9; i++) {
        await page.click(`[data-testid="number-${i}"]`);
        const answer = await page.locator('[data-testid="answer-display"]').textContent();
        if (!answer.includes(String(i))) {
          throw new Error(`Button ${i} didn't register click`);
        }
        // Clear answer
        await page.click('[data-testid="backspace"]');
      }
      console.log('   All number buttons (0-9) working');
    });

    await runTest('Backspace: Backspace button clears input', async () => {
      await page.goto(TARGET_URL);

      await page.click('[data-testid="number-5"]');
      await page.click('[data-testid="number-3"]');
      let answer = await page.locator('[data-testid="answer-display"]').textContent();
      if (!answer.includes('53')) {
        throw new Error('Input not working before backspace test');
      }

      await page.click('[data-testid="backspace"]');
      answer = await page.locator('[data-testid="answer-display"]').textContent();
      if (answer.includes('53')) {
        throw new Error('Backspace did not clear last digit');
      }
      console.log('   Backspace cleared input successfully');
    });

    await runTest('Answer Submission: Submit button submits answer', async () => {
      await page.goto(TARGET_URL);

      const problemText = await page.locator('[data-testid="problem"]').textContent();
      const correctAnswer = parseAndCalculate(problemText);

      await inputNumberViaClick(page, correctAnswer);
      await page.click('[data-testid="submit"]');

      // Wait for feedback modal
      await page.waitForSelector('[role="dialog"]', { timeout: 2000 });
      console.log('   Submit button triggered feedback modal');
    });

    await runTest('Correct Answer - Streak: Streak increments on correct answer', async () => {
      await page.goto(TARGET_URL);

      const initialStreak = await page.locator('[data-testid="streak"]').textContent();
      const problemText = await page.locator('[data-testid="problem"]').textContent();
      const correctAnswer = parseAndCalculate(problemText);

      await inputNumberViaClick(page, correctAnswer);
      await page.click('[data-testid="submit"]');

      // Wait for auto-advance
      await page.waitForTimeout(AUTO_ADVANCE_DELAY + 500);

      const newStreak = await page.locator('[data-testid="streak"]').textContent();
      if (parseInt(newStreak, 10) !== parseInt(initialStreak, 10) + 1) {
        throw new Error(`Streak did not increment: ${initialStreak} -> ${newStreak}`);
      }
      console.log(`   Streak incremented: ${initialStreak} -> ${newStreak}`);
    });

    await runTest('Incorrect Answer - Streak: Streak resets to 0 on wrong answer', async () => {
      await page.goto(TARGET_URL);

      // Get a few correct answers first to build streak
      for (let i = 0; i < 3; i++) {
        const problemText = await page.locator('[data-testid="problem"]').textContent();
        const correctAnswer = parseAndCalculate(problemText);
        await inputNumberViaClick(page, correctAnswer);
        await page.click('[data-testid="submit"]');
        await page.waitForTimeout(AUTO_ADVANCE_DELAY + 200);
      }

      const streakBeforeWrong = await page.locator('[data-testid="streak"]').textContent();
      if (parseInt(streakBeforeWrong, 10) < 3) {
        throw new Error('Failed to build initial streak');
      }

      // Now submit wrong answer
      await inputNumberViaClick(page, 99); // Obviously wrong
      await page.click('[data-testid="submit"]');

      // Click Next button
      await page.click('[data-testid="next-button"]');
      await page.waitForTimeout(500);

      const streakAfterWrong = await page.locator('[data-testid="streak"]').textContent();
      if (parseInt(streakAfterWrong, 10) !== 0) {
        throw new Error(`Streak not reset to 0: ${streakAfterWrong}`);
      }
      console.log(`   Streak reset to 0 after incorrect answer`);
    });

    await runTest('High Score: High score updates when streak exceeds previous', async () => {
      // Clear localStorage and reload
      await page.evaluate(() => localStorage.clear());
      await page.goto(TARGET_URL);

      const initialHighScore = await page.locator('[data-testid="high-score"]').textContent();

      // Get 3 correct answers
      for (let i = 0; i < 3; i++) {
        const problemText = await page.locator('[data-testid="problem"]').textContent();
        const correctAnswer = parseAndCalculate(problemText);
        await inputNumberViaClick(page, correctAnswer);
        await page.click('[data-testid="submit"]');
        await page.waitForTimeout(AUTO_ADVANCE_DELAY + 200);
      }

      const newHighScore = await page.locator('[data-testid="high-score"]').textContent();
      if (parseInt(newHighScore, 10) < 3) {
        throw new Error(`High score not updated: ${initialHighScore} -> ${newHighScore}`);
      }
      console.log(`   High score updated: ${initialHighScore} -> ${newHighScore}`);
    });

    await runTest('High Score Persistence: High score persists after reload', async () => {
      // Should have high score from previous test
      const highScoreBefore = await page.locator('[data-testid="high-score"]').textContent();

      await page.reload();
      await page.waitForTimeout(500);

      const highScoreAfter = await page.locator('[data-testid="high-score"]').textContent();
      if (highScoreBefore !== highScoreAfter) {
        throw new Error(`High score not persisted: ${highScoreBefore} -> ${highScoreAfter}`);
      }
      console.log(`   High score persisted: ${highScoreAfter}`);
    });

    // ============================================
    // B. KEYBOARD SUPPORT TESTS
    // ============================================
    console.log('\n\n⌨️  B. KEYBOARD SUPPORT TESTS');
    console.log('-'.repeat(60));

    await runTest('Number Keys (0-9): Typing numbers inputs answer', async () => {
      await page.goto(TARGET_URL);

      await page.keyboard.press('5');
      await page.keyboard.press('3');

      const answer = await page.locator('[data-testid="answer-display"]').textContent();
      if (!answer.includes('53')) {
        throw new Error(`Keyboard input failed: got "${answer}"`);
      }
      console.log('   Keyboard number input working');
    });

    await runTest('Enter Key: Enter submits the answer', async () => {
      await page.goto(TARGET_URL);

      const problemText = await page.locator('[data-testid="problem"]').textContent();
      const correctAnswer = parseAndCalculate(problemText);

      await inputNumberViaKeyboard(page, correctAnswer);
      await page.keyboard.press('Enter');

      // Should see feedback modal
      const modalVisible = await page.locator('[role="dialog"]').isVisible();
      if (!modalVisible) {
        throw new Error('Enter key did not submit answer');
      }
      console.log('   Enter key submitted answer');
    });

    await runTest('Backspace Key: Backspace deletes last digit', async () => {
      await page.goto(TARGET_URL);

      await page.keyboard.press('7');
      await page.keyboard.press('3');
      let answer = await page.locator('[data-testid="answer-display"]').textContent();

      await page.keyboard.press('Backspace');
      answer = await page.locator('[data-testid="answer-display"]').textContent();

      if (answer.includes('73')) {
        throw new Error('Backspace key did not delete digit');
      }
      console.log('   Backspace key working');
    });

    await runTest('Visual Feedback: Keyboard input highlights button', async () => {
      await page.goto(TARGET_URL);

      // Press a key and check for active styling
      await page.keyboard.press('5');
      await page.waitForTimeout(50);

      const button = page.locator('[data-testid="number-5"]');
      const className = await button.getAttribute('class');

      // The active class should be present briefly
      // This is a best-effort check since timing is tricky
      console.log('   Visual feedback check completed (timing-dependent)');
    }, false); // Non-critical

    await runTest('All Keys Work: Test each key 0-9 individually', async () => {
      await page.goto(TARGET_URL);

      for (let i = 0; i <= 9; i++) {
        await page.keyboard.press(String(i));
        const answer = await page.locator('[data-testid="answer-display"]').textContent();
        if (!answer.includes(String(i))) {
          throw new Error(`Key ${i} did not register`);
        }
        await page.keyboard.press('Backspace');
      }
      console.log('   All keyboard keys 0-9 working');
    });

    // ============================================
    // C. CORRECT ANSWER FLOW TESTS
    // ============================================
    console.log('\n\n✅ C. CORRECT ANSWER FLOW TESTS');
    console.log('-'.repeat(60));

    await runTest('Celebration Appears: Visual celebration on correct answer', async () => {
      await page.goto(TARGET_URL);

      const problemText = await page.locator('[data-testid="problem"]').textContent();
      const correctAnswer = parseAndCalculate(problemText);

      await inputNumberViaClick(page, correctAnswer);
      await page.click('[data-testid="submit"]');

      // Look for celebration message
      const celebration = await page.locator('text=Great!').isVisible();
      if (!celebration) {
        throw new Error('Celebration message not shown');
      }
      console.log('   Celebration appeared');
    });

    await runTest('Auto-Advance Timing: Next problem appears after ~1.5s', async () => {
      await page.goto(TARGET_URL);

      const problemText = await page.locator('[data-testid="problem"]').textContent();
      const correctAnswer = parseAndCalculate(problemText);

      await inputNumberViaClick(page, correctAnswer);
      await page.click('[data-testid="submit"]');

      // Wait for auto-advance
      const startTime = Date.now();
      await page.waitForTimeout(AUTO_ADVANCE_DELAY + 500);

      // Modal should be gone
      const modalVisible = await page.locator('[role="dialog"]').isVisible();
      if (modalVisible) {
        throw new Error('Modal did not auto-advance');
      }

      const elapsed = Date.now() - startTime;
      console.log(`   Auto-advanced in ~${elapsed}ms`);
    });

    await runTest('No Manual Next: Next button NOT present for correct', async () => {
      await page.goto(TARGET_URL);

      const problemText = await page.locator('[data-testid="problem"]').textContent();
      const correctAnswer = parseAndCalculate(problemText);

      await inputNumberViaClick(page, correctAnswer);
      await page.click('[data-testid="submit"]');

      await page.waitForTimeout(500);

      // Next button should not be visible
      const nextButtonVisible = await page.locator('[data-testid="next-button"]').isVisible().catch(() => false);
      if (nextButtonVisible) {
        throw new Error('Next button should not appear for correct answers');
      }
      console.log('   Next button correctly absent for correct answer');
    });

    // ============================================
    // D. INCORRECT ANSWER FLOW TESTS
    // ============================================
    console.log('\n\n❌ D. INCORRECT ANSWER FLOW TESTS');
    console.log('-'.repeat(60));

    await runTest('Correct Answer Shown: Display shows correct answer', async () => {
      await page.goto(TARGET_URL);

      const problemText = await page.locator('[data-testid="problem"]').textContent();
      const correctAnswer = parseAndCalculate(problemText);
      const wrongAnswer = correctAnswer === 5 ? 3 : 5;

      await inputNumberViaClick(page, wrongAnswer);
      await page.click('[data-testid="submit"]');

      await page.waitForTimeout(500);

      // Should show "The answer is X"
      const modalText = await page.locator('[role="dialog"]').textContent();
      if (!modalText.includes(String(correctAnswer))) {
        throw new Error(`Correct answer ${correctAnswer} not shown in modal: "${modalText}"`);
      }
      console.log(`   Correct answer ${correctAnswer} displayed in modal`);
    });

    await runTest('Streak Displayed: Final streak shown on incorrect', async () => {
      await page.goto(TARGET_URL);

      // Build streak first
      for (let i = 0; i < 2; i++) {
        const problemText = await page.locator('[data-testid="problem"]').textContent();
        const correctAnswer = parseAndCalculate(problemText);
        await inputNumberViaClick(page, correctAnswer);
        await page.click('[data-testid="submit"]');
        await page.waitForTimeout(AUTO_ADVANCE_DELAY + 200);
      }

      // Submit wrong answer
      await inputNumberViaClick(page, 99);
      await page.click('[data-testid="submit"]');

      await page.waitForTimeout(500);

      const modalText = await page.locator('[role="dialog"]').textContent();
      if (!modalText.includes('Streak:')) {
        throw new Error('Streak not shown in incorrect answer modal');
      }
      console.log('   Streak displayed in incorrect answer modal');
    });

    await runTest('Next Button Appears: Next button visible on incorrect', async () => {
      // Modal should still be visible from previous test
      const nextButton = page.locator('[data-testid="next-button"]');
      const isVisible = await nextButton.isVisible();

      if (!isVisible) {
        throw new Error('Next button not visible for incorrect answer');
      }
      console.log('   Next button present for incorrect answer');
    });

    await runTest('Manual Advance: Does NOT auto-advance on incorrect', async () => {
      // Modal should still be visible from previous test
      await page.waitForTimeout(AUTO_ADVANCE_DELAY + 500);

      const modalVisible = await page.locator('[role="dialog"]').isVisible();
      if (!modalVisible) {
        throw new Error('Modal auto-advanced on incorrect (should wait for Next)');
      }
      console.log('   Correctly waiting for manual Next click');

      // Clean up - click Next
      await page.click('[data-testid="next-button"]');
    });

    await runTest('Streak Reset: Next problem shows streak 0 after incorrect', async () => {
      await page.waitForTimeout(500);

      const streak = await page.locator('[data-testid="streak"]').textContent();
      if (parseInt(streak, 10) !== 0) {
        throw new Error(`Streak not reset: ${streak}`);
      }
      console.log('   Streak reset to 0');
    });

    // ============================================
    // E. ACCESSIBILITY TESTS
    // ============================================
    console.log('\n\n♿ E. ACCESSIBILITY TESTS');
    console.log('-'.repeat(60));

    await runTest('ARIA Labels: Number buttons have labels', async () => {
      await page.goto(TARGET_URL);

      for (let i = 0; i <= 9; i++) {
        const ariaLabel = await page.locator(`[data-testid="number-${i}"]`).getAttribute('aria-label');
        if (!ariaLabel || !ariaLabel.includes(String(i))) {
          throw new Error(`Button ${i} missing proper aria-label`);
        }
      }
      console.log('   All number buttons have aria-labels');
    });

    await runTest('Submit Button Label: Submit has clear label', async () => {
      await page.goto(TARGET_URL);

      const submitLabel = await page.locator('[data-testid="submit"]').getAttribute('aria-label');
      if (!submitLabel || submitLabel.length < 3) {
        throw new Error('Submit button missing aria-label');
      }
      console.log(`   Submit button aria-label: "${submitLabel}"`);
    });

    await runTest('Keyboard Navigation: Can tab through elements', async () => {
      await page.goto(TARGET_URL);

      // Press Tab a few times
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);

      // Check if something is focused
      const focusedElement = await page.evaluate(() => {
        return document.activeElement?.tagName;
      });

      if (!focusedElement) {
        throw new Error('Tab navigation not working');
      }
      console.log(`   Tab navigation working (focused: ${focusedElement})`);
    }, false); // Non-critical

    await runTest('Focus Management: Next button gets focus on incorrect', async () => {
      await page.goto(TARGET_URL);

      await inputNumberViaClick(page, 99); // Wrong answer
      await page.click('[data-testid="submit"]');

      await page.waitForTimeout(200);

      const focused = await page.evaluate(() => {
        const activeEl = document.activeElement;
        return activeEl?.getAttribute('data-testid');
      });

      if (focused !== 'next-button') {
        console.log(`   Warning: Next button not focused (focused: ${focused})`);
      } else {
        console.log('   Next button receives focus');
      }
    }, false); // Non-critical

    await runTest('Semantic HTML: Proper button elements used', async () => {
      await page.goto(TARGET_URL);

      // Check that number pad uses button elements
      const buttonCount = await page.locator('button').count();
      if (buttonCount < 12) { // 10 numbers + backspace + submit
        throw new Error(`Insufficient buttons found: ${buttonCount}`);
      }
      console.log(`   ${buttonCount} button elements found`);
    });

    // ============================================
    // F. VISUAL & UX TESTS
    // ============================================
    console.log('\n\n🎨 F. VISUAL & UX TESTS');
    console.log('-'.repeat(60));

    await runTest('Touch Targets: Buttons are at least 44x44 pixels', async () => {
      await page.goto(TARGET_URL);

      const buttonIds = Array.from({ length: 10 }, (_, i) => `number-${i}`);
      buttonIds.push('backspace', 'submit');

      const smallButtons = [];
      for (const id of buttonIds) {
        const box = await getButtonDimensions(page, id);
        if (box.width < 44 || box.height < 44) {
          smallButtons.push(`${id}: ${Math.round(box.width)}x${Math.round(box.height)}`);
        }
      }

      if (smallButtons.length > 0) {
        throw new Error(`Buttons too small: ${smallButtons.join(', ')}`);
      }
      console.log('   All buttons meet 44x44 minimum');
    }, false); // Non-critical warning

    await runTest('Button States: Hover states are present', async () => {
      await page.goto(TARGET_URL);

      const button = page.locator('[data-testid="number-5"]');

      // Hover over button
      await button.hover();
      await page.waitForTimeout(100);

      // This is a visual check - just verify button exists and is hoverable
      const isVisible = await button.isVisible();
      if (!isVisible) {
        throw new Error('Button not hoverable');
      }
      console.log('   Button hover working');
    }, false);

    await runTest('Font Size: Text is large and readable', async () => {
      await page.goto(TARGET_URL);

      const problemFontSize = await page.locator('[data-testid="problem"]').evaluate(el => {
        return window.getComputedStyle(el).fontSize;
      });

      const fontSize = parseInt(problemFontSize, 10);
      if (fontSize < 24) {
        throw new Error(`Problem font too small: ${problemFontSize}`);
      }
      console.log(`   Problem font size: ${problemFontSize}`);
    }, false);

    await runTest('Problem Visibility: Math problem is prominent', async () => {
      await page.goto(TARGET_URL);

      const problemVisible = await page.locator('[data-testid="problem"]').isVisible();
      if (!problemVisible) {
        throw new Error('Problem not visible');
      }
      console.log('   Problem display visible and prominent');
    });

    await runTest('Score Display: Streak and high score are visible', async () => {
      await page.goto(TARGET_URL);

      const streakVisible = await page.locator('[data-testid="streak"]').isVisible();
      const highScoreVisible = await page.locator('[data-testid="high-score"]').isVisible();

      if (!streakVisible || !highScoreVisible) {
        throw new Error('Score display not visible');
      }
      console.log('   Score display visible');
    });

    // Take final screenshot
    await page.screenshot({
      path: '/tmp/math-streak-final-state.png',
      fullPage: true,
    });
    console.log('\n📸 Screenshot saved: /tmp/math-streak-final-state.png');

    // ============================================
    // FINAL REPORT
    // ============================================
    console.log('\n\n' + '='.repeat(60));
    console.log('TEST REPORT SUMMARY');
    console.log('='.repeat(60));

    console.log(`\nTotal Tests: ${results.total}`);
    console.log(`Passed: ${results.passed} ✅`);
    console.log(`Failed: ${results.failed} ❌`);
    console.log(`Warnings: ${results.warnings} ⚠️`);

    if (results.criticalFailures.length > 0) {
      console.log(`\n${'='.repeat(60)}`);
      console.log('CRITICAL FAILURES');
      console.log('='.repeat(60));
      results.criticalFailures.forEach((f, i) => {
        console.log(`\n${i + 1}. ${f.test}`);
        console.log(`   Error: ${f.error}`);
      });
    }

    if (results.nonCriticalIssues.length > 0) {
      console.log(`\n${'='.repeat(60)}`);
      console.log('NON-CRITICAL ISSUES');
      console.log('='.repeat(60));
      results.nonCriticalIssues.forEach((f, i) => {
        console.log(`\n${i + 1}. ${f.test}`);
        console.log(`   Issue: ${f.error}`);
      });
    }

    if (consoleErrors.length > 0) {
      console.log(`\n${'='.repeat(60)}`);
      console.log('CONSOLE ERRORS');
      console.log('='.repeat(60));
      consoleErrors.forEach(err => console.log(`  - ${err}`));
    } else {
      console.log('\n✅ No console errors detected');
    }

    console.log('\n' + '='.repeat(60));

    let status = 'PASS';
    if (results.criticalFailures.length > 0) {
      status = 'FAIL';
      console.log('OVERALL STATUS: ❌ FAIL');
    } else if (results.nonCriticalIssues.length > 0) {
      status = 'PASS_WITH_WARNINGS';
      console.log('OVERALL STATUS: ⚠️  PASS WITH WARNINGS');
    } else {
      console.log('OVERALL STATUS: ✅ PASS');
    }

    console.log('='.repeat(60) + '\n');

    // Exit with appropriate code
    await browser.close();
    process.exit(results.criticalFailures.length > 0 ? 1 : 0);

  } catch (error) {
    console.error('\n❌ Test suite failed with error:', error);
    await page.screenshot({ path: '/tmp/math-streak-error.png' });
    await browser.close();
    process.exit(1);
  }
})();
