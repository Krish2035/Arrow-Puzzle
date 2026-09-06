const puppeteer = require('puppeteer-core');
const path = require('path');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const artifactDir = 'C:\\Users\\DELL\\.gemini\\antigravity-ide\\brain\\0e67bd0c-a1e0-4663-868d-8e010108a398';

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // 1. Mobile Level 1 (Tutorial)
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://localhost:3000?view=game&level=1', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(artifactDir, 'level1_tutorial_view.png') });
  console.log('Captured level1_tutorial_view.png');

  // 2. Mobile Level 2
  await page.goto('http://localhost:3000?view=game&level=2', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(artifactDir, 'level2_game_view.png') });
  console.log('Captured level2_game_view.png');

  // 3. Mobile Level 4
  await page.goto('http://localhost:3000?view=game&level=4', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(artifactDir, 'level4_game_view.png') });
  console.log('Captured level4_game_view.png');

  // 4. Desktop Level 2
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000?view=game&level=2', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(artifactDir, 'desktop_level2_view.png') });
  console.log('Captured desktop_level2_view.png');

  await browser.close();
  console.log('ALL NEW LEVEL SHOTS CAPTURED!');
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
