/**
 * End-to-end check of the key demo journey, run in a real browser against the production build.
 *
 *   npm run test:e2e
 *
 * Needs a Chromium for Playwright once per machine:  npx playwright install chromium
 */
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import { preview } from 'vite';

const server = await preview({ preview: { port: 4183, strictPort: false, open: false }, logLevel: 'silent' });
const BASE = server.resolvedUrls.local[0];
const SHOTS = new URL('./screenshots/', import.meta.url).pathname;
await mkdir(SHOTS, { recursive: true });

let passed = 0;
const failures = [];
const consoleErrors = [];

async function step(name, fn) {
  try {
    await fn();
    passed += 1;
    console.log(`  ok    ${name}`);
  } catch (error) {
    failures.push(name);
    console.log(`  FAIL  ${name}\n        ${String(error.message).split('\n')[0]}`);
  }
}

function expect(condition, message) {
  if (!condition) throw new Error(message);
}

/** Waits until the element's text satisfies the predicate (figures count up, so they settle). */
async function expectText(locator, test, message) {
  const deadline = Date.now() + 6000;
  let text = '';
  while (Date.now() < deadline) {
    text = ((await locator.first().textContent().catch(() => '')) ?? '').trim();
    if (typeof test === 'string' ? text.includes(test) : test(text)) return;
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error(`${message ?? 'Unexpected text'}: expected ${typeof test === 'string' ? `"${test}"` : 'a match'}, got "${text.slice(0, 120)}"`);
}

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
const page = await context.newPage();
page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));
page.on('pageerror', (e) => consoleErrors.push(String(e)));

const heading = (name) => page.getByRole('heading', { level: 1, name });
const sidebar = page.getByRole('complementary');
const demoView = page.getByRole('group', { name: 'Demo view' });
const pct = page.getByTestId('achieved-pct');

async function asInstructorOpenOliver() {
  await demoView.getByRole('button', { name: 'Instructor' }).click();
  await heading('Hello, Hannah').waitFor();
  await sidebar.getByRole('link', { name: 'Swimmers' }).click();
  await heading('Swimmers').waitFor();
  await page.locator('main a[href*="/instructor/swimmers/child-oliver"]').click();
  await heading('Oliver Williams').waitFor();
}

console.log('\nParent experience');

await step('Start screen states plainly that this is a demonstration, with the route through it', async () => {
  await page.goto(BASE);
  const notice = page.getByTestId('demo-disclaimer');
  for (const phrase of ['fictional', 'Sign-in is simulated', 'Do not enter any real', 'not a live service', 'not official stage', 'do not predict']) {
    await expectText(notice, phrase);
  }
  await expectText(page.locator('main'), 'Open the parent view');
  const body = (await page.locator('body').innerText()).toLowerCase();
  for (const banned of ['guarantee', 'faster', 'lampton', '£']) {
    expect(!body.includes(banned), `Start screen should not contain "${banned}"`);
  }
});

await step('1. Enter the parent demo', async () => {
  await page.goto(BASE);
  await page.getByRole('button', { name: /Continue as Parent/ }).click();
  await heading('Welcome back, Sarah!').waitFor();
});

await step("2. Oliver's dashboard shows consistent figures", async () => {
  await expectText(pct, (t) => t === '50%', 'Targets achieved');
  await expectText(page.getByTestId('achieved-count'), '8 of 16 assessed development targets achieved');
  await expectText(page.getByTestId('mastered-count'), '3 skills mastered, 1 not yet assessed');
  await expectText(page.getByTestId('latest-achievement'), 'Oliver has mastered consistent flutter kicking!');
  await expectText(page.getByTestId('next-priority'), 'Maintaining body alignment while breathing to the side.');
  await expectText(page.getByTestId('latest-update'), 'coordinating breathing without interrupting his rhythm');
  await expectText(page.getByTestId('unread-count').first(), (t) => t === '2', 'Unread notifications');
  await expectText(page.getByTestId('metric-explanation'), 'not a prediction of passing a stage');
  await expectText(page.getByTestId('improving'), '5 skills moved up in week 3');
  await expectText(page.getByTestId('needs-work'), 'presses down with his leading arm');
  await expectText(page.getByTestId('needs-work'), 'Next target in coaching: Keep the leading arm extended');
  await expectText(page.getByTestId('metric-explanation'), "not Oliver's overall swimming ability");
  await expectText(page.getByTestId('demo-notice').first(), "no real children's data");
  await page.screenshot({ path: `${SHOTS}01-parent-dashboard.png`, fullPage: true });
});

await step('   The parent view contains no other swimmers', async () => {
  const text = await page.locator('body').innerText();
  expect(!/Isla|Noah|Amelia|Leo Martins/.test(text), 'Another swimmer is visible to the parent');
});

await step('   "How this is calculated" explains the metric with live numbers', async () => {
  await page.getByRole('button', { name: 'How this is calculated' }).click();
  const dialog = page.getByRole('dialog', { name: 'How progress is calculated' });
  await expectText(dialog, '8 achieved ÷ 16 assessed × 100 = 50%');
  await expectText(dialog, 'not an official stage assessment');
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'detached' });
});

await step('   The optional demo guide jumps straight to a step', async () => {
  await page.getByRole('button', { name: 'Demo guide' }).click();
  const guide = page.getByRole('dialog', { name: 'A two-minute route through the demo' });
  await guide.getByRole('button', { name: 'Open Side breathing' }).click();
  await heading('Side breathing').waitFor();
  await guide.waitFor({ state: 'detached' });
  await sidebar.getByRole('link', { name: 'Home' }).click();
  await heading('Welcome back, Sarah!').waitFor();
});

await step('3. Open Front Crawl skills', async () => {
  await sidebar.getByRole('link', { name: 'My Skills' }).click();
  await heading('Front Crawl skills').waitFor();
  const count = await page.locator('main a[href*="/parent/skills/"]').count();
  expect(count === 17, `Expected 17 skills, found ${count}`);
});

await step('4. Select Side Breathing', async () => {
  await page.getByRole('link', { name: /Side breathing/ }).click();
  await heading('Side breathing').waitFor();
});

await step('5. Read the skill description and assessment', async () => {
  await expectText(page.getByTestId('skill-status'), (t) => t === 'Developing', 'Current assessment');
  await expectText(page.getByTestId('skill-feedback'), 'becoming more comfortable turning his head');
  await expectText(page.getByTestId('skill-target'), 'three consecutive side-breathing attempts');
  for (const title of ['Skill objective', 'Why this skill matters', 'Success criteria', 'Video demonstration', 'Assessment history']) {
    await page.getByRole('heading', { name: title }).waitFor();
  }
  expect((await page.getByRole('radio').count()) === 0, 'A parent should not see assessment controls');
  await page.screenshot({ path: `${SHOTS}02-skill-detail.png`, fullPage: true });
});

await step('   Three video slots, each an honest placeholder with no fake play button', async () => {
  const tabs = page.getByRole('tablist', { name: 'Videos for Side breathing' });
  for (const [tab, heading] of [
    ['Correct technique', 'What to look for'],
    ['Common mistakes', 'Mistakes to watch for'],
    ['What parents should notice', 'From the poolside'],
  ]) {
    await tabs.getByRole('tab', { name: tab }).click();
    await expectText(page.locator('#video-panel'), heading);
    await expectText(page.getByTestId('video-placeholder'), 'Video not yet filmed');
  }
  expect((await page.locator('#video-panel button, #video-panel video').count()) === 0, 'Placeholder should not offer playback');
});

console.log('\nInstructor experience');

await step('6. Switch to the instructor demo', async () => {
  await demoView.getByRole('button', { name: 'Instructor' }).click();
  await heading('Hello, Hannah').waitFor();
  await page.screenshot({ path: `${SHOTS}03-instructor-overview.png`, fullPage: true });
});

await step("7. Find Oliver with search and open his assessment", async () => {
  await sidebar.getByRole('link', { name: 'Swimmers' }).click();
  await page.getByLabel('Search swimmers by name or stage').fill('oli');
  const rows = page.locator('main a[href*="/instructor/swimmers/"]');
  await expectText(page.locator('main'), 'Oliver Williams');
  expect((await rows.count()) === 1, 'Search should leave one swimmer');
  await rows.first().click();
  await heading('Oliver Williams').waitFor();
  await expectText(page.getByTestId('plan-achieved'), '50%');
});

await step('8. Change the skill status', async () => {
  const group = page.getByRole('radiogroup', { name: 'Assessment for Side breathing' });
  expect(await group.getByRole('radio', { name: 'Developing' }).isChecked(), 'Developing should be selected first');
  await group.getByRole('radio', { name: 'Consistent' }).click();
  await expectText(page.getByTestId('unsaved-count'), '1 unsaved change');
  await expectText(page.getByTestId('assess-br-side'), 'Was Developing');
  await page.getByRole('button', { name: 'Notes for Side breathing' }).click();
  await page.getByLabel('Coaching note for Sarah').fill('Oliver turned his head to the side on four breaths in a row today.');
});

await step('   Unsaved work survives leaving the sheet and coming back', async () => {
  await page.getByRole('tab', { name: 'History' }).click();
  await sidebar.getByRole('link', { name: 'Sessions' }).click();
  await heading('Sessions').waitFor();
  await sidebar.getByRole('link', { name: 'Assessments' }).click();
  await heading('Assessments').waitFor();
  await expectText(page.getByTestId('pick-child-oliver'), 'Unsaved changes');
  await expectText(page.getByTestId('unsaved-count'), '1 unsaved change for Oliver');
  await page.goBack();
  await page.goBack();
  await heading('Oliver Williams').waitFor();
  await page.getByRole('tab', { name: 'Assess' }).click();
  const group = page.getByRole('radiogroup', { name: 'Assessment for Side breathing' });
  expect(await group.getByRole('radio', { name: 'Consistent' }).isChecked(), 'The staged change was lost');
});

await step('9. Save the update', async () => {
  await page.getByRole('button', { name: 'Save assessment' }).click();
  const result = page.getByTestId('save-result');
  await expectText(result, '50% to 56%');
  await expectText(result, "Sarah Williams's dashboard has been updated");
  await expectText(page.getByTestId('plan-achieved'), '56%');
  await page.screenshot({ path: `${SHOTS}04-assessment-saved.png`, fullPage: true });
});

await step('   The change is in the assessment history', async () => {
  await page.getByRole('tab', { name: 'History' }).click();
  const first = page.getByTestId('history-week-3').locator('li').first();
  await expectText(first, 'Side breathing');
  await expectText(first, 'Consistent');
  await page.getByRole('tab', { name: 'Assess' }).click();
});

console.log('\nBack in the parent experience');

await step('10. Return to the parent demo', async () => {
  await page.getByTestId('save-result').getByRole('button', { name: 'View as parent' }).click().catch(async () => {
    await demoView.getByRole('button', { name: 'Parent' }).click();
  });
  await heading('Welcome back, Sarah!').waitFor();
});

await step('11. The new assessment appears', async () => {
  await page.getByRole('link', { name: /Side breathing/ }).first().click();
  await heading('Side breathing').waitFor();
  await expectText(page.getByTestId('skill-status'), (t) => t === 'Consistent', 'Current assessment');
  await expectText(page.getByTestId('skill-feedback'), 'four breaths in a row today');
  await sidebar.getByRole('link', { name: 'Progress Journey' }).click();
  await expectText(page.getByTestId('journey-latest-pct'), '56%');
  await expectText(page.getByTestId('week-3'), 'Side breathing');
});

await step('12. Progress calculations update', async () => {
  await sidebar.getByRole('link', { name: 'Home' }).click();
  await expectText(pct, (t) => t === '56%', 'Targets achieved');
  await expectText(page.getByTestId('achieved-count'), '9 of 16 assessed development targets achieved');
  await expectText(page.getByTestId('mastered-count'), '3 skills mastered');
  await expectText(page.getByTestId('unread-count').first(), (t) => t === '3', 'Unread notifications');
  expect((await page.getByRole('dialog').count()) === 0, 'No celebration expected: nothing was newly mastered');
});

await step('13. An achievement appears when a skill is newly Mastered', async () => {
  await asInstructorOpenOliver();
  // Keyboard only: focus the selected option and move right to Mastered.
  const group = page.getByRole('radiogroup', { name: 'Assessment for Side breathing' });
  await group.getByRole('radio', { name: 'Consistent' }).focus();
  await page.keyboard.press('ArrowRight');
  expect(await group.getByRole('radio', { name: 'Mastered' }).isChecked(), 'Arrow key should select Mastered');
  await page.getByRole('button', { name: 'Save assessment' }).click();
  await expectText(page.getByTestId('save-result'), 'Achievement sent to Sarah: Oliver has mastered side breathing!');
  // Selecting Mastered again is not a change, so there is nothing to save and no second achievement.
  await group.getByRole('radio', { name: 'Mastered' }).click();
  await expectText(page.getByTestId('unsaved-count'), 'No unsaved changes');
  expect(await page.getByRole('button', { name: 'Save assessment' }).isDisabled(), 'Save should be disabled with nothing to save');
  await page.getByTestId('save-result').getByRole('button', { name: 'View as parent' }).click();

  const dialog = page.getByRole('dialog', { name: /Oliver has mastered side breathing/ });
  await dialog.waitFor();
  await page.screenshot({ path: `${SHOTS}05-achievement-celebration.png` });
  await dialog.getByRole('button', { name: /See what we're working on next/ }).click();
  await heading('Side breathing').waitFor();
  await expectText(page.getByTestId('skill-status'), (t) => t === 'Mastered', 'Current assessment');

  await sidebar.getByRole('link', { name: 'Home' }).click();
  await expectText(page.getByTestId('mastered-count'), '4 skills mastered');
  await expectText(page.getByTestId('latest-achievement'), 'Oliver has mastered side breathing!');
  expect((await page.getByRole('dialog').count()) === 0, 'The celebration should only be shown once');
  await sidebar.getByRole('link', { name: 'Achievements' }).click();
  await heading('Achievements').waitFor();
  const cards = await page.getByTestId('achievement-card').count();
  expect(cards === 4, `Expected 4 achievements, found ${cards}`);
});

console.log('\nOther checks');

await step('Changes persist after a reload', async () => {
  await page.goto(`${BASE}#/parent`);
  await page.reload();
  await heading('Welcome back, Sarah!').waitFor();
  await expectText(pct, (t) => t === '56%', 'Targets achieved after reload');
});

await step('Notifications: panel opens, links to the skill, and can be marked as read', async () => {
  await page.getByRole('button', { name: /^Notifications/ }).last().click();
  const panel = page.getByRole('dialog', { name: 'Notifications' });
  await expectText(panel, 'Oliver has mastered side breathing!');
  await panel.getByRole('button', { name: 'Mark all as read' }).click();
  expect((await page.getByTestId('unread-count').count()) === 0, 'Unread badge should clear');
  await panel.getByRole('button', { name: /Oliver has mastered side breathing/ }).click();
  await heading('Side breathing').waitFor();
});

await step('A second window updates live when the instructor saves', async () => {
  const parentWindow = await context.newPage();
  await parentWindow.goto(`${BASE}#/parent`);
  await expectText(parentWindow.getByTestId('achieved-pct'), (t) => t === '56%');
  await page.goto(`${BASE}#/instructor/assessments`);
  await heading('Assessments').waitFor();
  await page.getByRole('radiogroup', { name: 'Assessment for Relaxed ankles' }).getByRole('radio', { name: 'Consistent' }).click();
  await page.getByRole('button', { name: 'Save assessment' }).click();
  await expectText(page.getByTestId('save-result'), '56% to 63%');
  await expectText(parentWindow.getByTestId('achieved-pct'), (t) => t === '63%', 'Other window');
  await parentWindow.close();
});

await step('Correcting a Mastered skill withdraws its achievement', async () => {
  await page.getByRole('radiogroup', { name: 'Assessment for Side breathing' }).getByRole('radio', { name: 'Consistent' }).click();
  await page.getByRole('button', { name: 'Save assessment' }).click();
  await expectText(page.getByTestId('save-result'), '1 achievement withdrawn');
});

await step('Notes tab: instructor can send an update with objectives and set the next priority', async () => {
  await page.goto(`${BASE}#/instructor/swimmers/child-oliver?tab=notes`);
  await page.getByLabel('How the session went').fill('Oliver kept his leading arm long on two breaths today.');
  await page.getByRole('button', { name: 'Send update' }).click();
  await page.getByLabel('Next coaching priority').fill('Breathing every three arm pulls.');
  await page.getByRole('button', { name: 'Save priority' }).click();
  await page.goto(`${BASE}#/parent`);
  await expectText(page.getByTestId('latest-update'), 'leading arm long on two breaths');
  await expectText(page.getByTestId('next-priority'), 'Breathing every three arm pulls.');
});

await step('Empty states: swimmer not started, and a search with no results', async () => {
  await page.goto(`${BASE}#/instructor/swimmers/child-leo`);
  await expectText(page.locator('main'), 'Assessments open after the first session');
  await page.goto(`${BASE}#/instructor/swimmers`);
  await page.getByLabel('Search swimmers by name or stage').fill('zzz');
  await expectText(page.locator('main'), 'No swimmers match "zzz"');
  await page.goto(`${BASE}#/parent/skills/not-a-skill`);
  await expectText(page.locator('main'), 'This skill is not in the plan');
  await page.goto(`${BASE}#/nowhere`);
  await expectText(page.locator('body'), 'That page does not exist');
});

await step('Reset demo data restores the original figures', async () => {
  await page.goto(`${BASE}#/parent/profile`);
  await page.getByRole('button', { name: 'Reset demo data' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Reset demo data' }).click();
  await page.goto(`${BASE}#/parent`);
  await expectText(pct, (t) => t === '50%', 'Targets achieved after reset');
  await expectText(page.getByTestId('latest-achievement'), 'consistent flutter kicking');
});

await step('A class of four can be assessed in one pass: 3 skills, a note and one save each', async () => {
  await page.goto(`${BASE}#/instructor/assessments`);
  await heading('Assessments').waitFor();
  const klass = [
    ['Oliver', [['Relaxed ankles', 'Consistent'], ['Effective hand entry', 'Consistent'], ['Breathing rhythm', 'Developing']]],
    ['Isla', [['Kick generated from the hips', 'Consistent'], ['Relaxed ankles', 'Consistent'], ['Effective hand entry', 'Developing']]],
    ['Noah', [['Body alignment while breathing', 'Consistent'], ['Breathing rhythm', 'Consistent'], ['Maintaining technique over distance', 'Consistent']]],
    ['Amelia', [['Horizontal alignment', 'Consistent'], ['Head position', 'Consistent'], ['Controlled arm recovery', 'Developing']]],
  ];
  let taps = 0;
  const started = Date.now();
  for (let i = 0; i < klass.length; i += 1) {
    const [name, skills] = klass[i];
    await page.getByRole('heading', { level: 2, name: new RegExp(`^${name} `) }).waitFor();
    for (const [skill, state] of skills) {
      await page.getByRole('radiogroup', { name: `Assessment for ${skill}` }).getByRole('radio', { name: state }).click();
      taps += 1;
    }
    await page.getByLabel(/^Session note/).fill(`${name} worked hard today and made progress on three skills.`);
    await expectText(page.getByTestId('unsaved-count'), `4 unsaved changes for ${name}`);
    await page.getByRole('button', { name: 'Save assessment' }).click();
    taps += 1;
    await expectText(page.getByTestId('save-result'), '3 skills reassessed');
    await expectText(page.getByTestId('save-result'), 'Session note sent');
    if (i < klass.length - 1) {
      await page.getByTestId('save-result').getByRole('button', { name: new RegExp(`^Next: ${klass[i + 1][0]}`) }).click();
      taps += 1;
    }
  }
  for (const id of ['oliver', 'isla', 'noah', 'amelia']) {
    await expectText(page.getByTestId(`pick-child-${id}`), 'Updated today');
  }
  await expectText(page.locator('[data-testid^="class-progress-"]').first(), '3 of 3 updated today');
  console.log(`        (${taps} taps and 4 typed notes for four swimmers; scripted run took ${((Date.now() - started) / 1000).toFixed(1)}s, which is not a human timing)`);
  await page.screenshot({ path: `${SHOTS}08-class-assessed.png`, fullPage: true });
  await page.goto(`${BASE}#/parent`);
  await expectText(page.getByTestId('latest-update'), 'Oliver worked hard today');
});

await step('Parent view with no assessments shows clear empty states', async () => {
  await page.evaluate(() => {
    const key = 'swim-progress-plan.demo.v1';
    const data = JSON.parse(localStorage.getItem(key));
    const mine = (x) => x.childId === 'child-oliver';
    data.assessments = data.assessments.filter((x) => !mine(x));
    data.achievements = data.achievements.filter((x) => !mine(x));
    data.updates = data.updates.filter((x) => !mine(x));
    data.notifications = data.notifications.filter((x) => !mine(x));
    const plan = data.plans.find(mine);
    plan.currentWeek = 0;
    plan.focusSkillIds = [];
    plan.skillNotes = {};
    localStorage.setItem(key, JSON.stringify(data));
  });
  await page.reload();
  await heading('Welcome back, Sarah!').waitFor();
  const main = page.locator('main');
  await expectText(main, 'No assessments yet');
  await expectText(main, 'Nothing has been assessed yet');
  await expectText(main, 'will post an update after the first session');
  await expectText(main, 'it will be celebrated here');
  await page.screenshot({ path: `${SHOTS}09-parent-empty-state.png`, fullPage: true });
  await page.goto(`${BASE}#/parent/skills/br-side`);
  await expectText(page.getByTestId('skill-status'), 'Not yet assessed');
  await expectText(main, 'No feedback has been written for this skill yet');
  await page.goto(`${BASE}#/parent/journey`);
  await expectText(main, 'A comparison becomes available after the second session');
  await page.goto(`${BASE}#/parent/achievements`);
  await expectText(main, 'No achievements yet');
  await page.getByRole('button', { name: /^Notifications/ }).last().click();
  await expectText(page.getByRole('dialog', { name: 'Notifications' }), 'No notifications yet');
  await page.keyboard.press('Escape');
  // Put the original demo data back.
  await page.goto(`${BASE}#/parent/profile`);
  await page.getByRole('button', { name: 'Reset demo data' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Reset demo data' }).click();
  await page.goto(`${BASE}#/parent`);
  await expectText(pct, (t) => t === '50%', 'Targets achieved after reset');
});

await step('Tablet widths: no sideways scrolling on the main screens', async () => {
  for (const width of [768, 1024]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of ['/parent', '/parent/skills/br-side', '/parent/journey', '/instructor/assessments', '/instructor/swimmers/child-oliver']) {
      await page.goto(`${BASE}#${route}`);
      await page.locator('main h1').waitFor();
      await page.waitForTimeout(250);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow <= 0, `${route} at ${width}px scrolls sideways by ${overflow}px`);
    }
  }
  await page.screenshot({ path: `${SHOTS}10-tablet-assessments.png`, fullPage: true });
  await page.setViewportSize({ width: 1366, height: 900 });
});

await step('Keyboard: skip link, visible focus, and Enter activates the demo entry', async () => {
  await page.goto(`${BASE}#/parent/profile`);
  await page.getByRole('button', { name: 'Exit demo' }).last().click();
  await page.getByRole('heading', { name: 'Choose a demo view' }).waitFor();
  await page.keyboard.press('Tab');
  const focused = page.locator(':focus');
  await expectText(focused, 'Continue as Parent');
  const outline = await focused.evaluate((el) => getComputedStyle(el).outlineStyle);
  expect(outline !== 'none', 'Focused control has no visible outline');
  await page.keyboard.press('Enter');
  await heading('Welcome back, Sarah!').waitFor();
  await page.keyboard.press('Tab');
  await expectText(page.locator(':focus'), 'Skip to content');
});

await step('Phone layout: bottom navigation works and nothing scrolls sideways', async () => {
  const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const mobile = await phone.newPage();
  mobile.on('pageerror', (e) => consoleErrors.push(String(e)));
  await mobile.goto(BASE);
  await mobile.getByRole('button', { name: /Continue as Parent/ }).click();
  await mobile.getByRole('heading', { level: 1, name: 'Welcome back, Sarah!' }).waitFor();
  expect(await mobile.getByTestId('demo-notice').first().isVisible(), 'Demo notice is hidden on a phone');
  await expectText(mobile.getByTestId('demo-notice').first(), 'Not a live service');
  const nav = mobile.getByRole('navigation', { name: 'Parent navigation' }).last();
  expect(await nav.isVisible(), 'Bottom navigation is not visible');
  const routes = [
    ['Skills', 'Front Crawl skills'],
    ['Journey', 'Progress Journey'],
    ['Achieved', 'Achievements'],
    ['Profile', 'Profile'],
    ['Home', 'Welcome back, Sarah!'],
  ];
  for (const [link, title] of routes) {
    await nav.getByRole('link', { name: link }).click();
    await mobile.getByRole('heading', { level: 1, name: title }).waitFor();
    const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow <= 0, `${title} scrolls sideways by ${overflow}px`);
  }
  await mobile.screenshot({ path: `${SHOTS}06-phone-dashboard.png`, fullPage: true });
  await mobile.goto(`${BASE}#/instructor/assessments`);
  await mobile.getByRole('heading', { level: 1, name: 'Assessments' }).waitFor();
  const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow <= 0, `Assessments scrolls sideways by ${overflow}px`);
  await mobile.screenshot({ path: `${SHOTS}07-phone-assessments.png`, fullPage: true });
  await phone.close();
});

await step('No errors were logged in the browser console', async () => {
  expect(consoleErrors.length === 0, `Console errors: ${consoleErrors.slice(0, 3).join(' | ')}`);
});

await browser.close();
await new Promise((resolve) => server.httpServer.close(resolve));

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length > 0) {
  console.log(failures.map((f) => `  - ${f}`).join('\n'));
  process.exit(1);
}
