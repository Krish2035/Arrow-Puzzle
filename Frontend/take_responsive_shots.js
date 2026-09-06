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

  // 1. Desktop Home (1440x900)
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000?view=home', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(artifactDir, 'desktop_home_view.png') });
  console.log('Captured desktop_home_view.png');

  // 2. Desktop Game (1440x900)
  await page.goto('http://localhost:3000?view=game&level=15', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(artifactDir, 'desktop_game_view.png') });
  console.log('Captured desktop_game_view.png');

  // 3. Desktop Win (1440x900)
  await page.goto('http://localhost:3000?view=win&level=15', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(artifactDir, 'desktop_win_view.png') });
  console.log('Captured desktop_win_view.png');

  // 4. Tablet Game (768x1024)
  await page.setViewport({ width: 768, height: 1024 });
  await page.goto('http://localhost:3000?view=game&level=15', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactDir, 'tablet_game_view.png') });
  console.log('Captured tablet_game_view.png');

  // 5. Mobile Game (390x844)
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://localhost:3000?view=game&level=15', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactDir, 'mobile_game_view.png') });
  console.log('Captured mobile_game_view.png');

  // 6. Mobile Home (390x844)
  await page.goto('http://localhost:3000?view=home', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(artifactDir, 'mobile_home_view.png') });
  console.log('Captured mobile_home_view.png');

  await browser.close();
  console.log('ALL SCREENSHOTS CAPTURED SUCCESSFULLY!');
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
