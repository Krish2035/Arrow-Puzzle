const puppeteer = require('./Frontend/node_modules/puppeteer-core');
const path = require('path');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const artifactDir = 'C:\\Users\\DELL\\.gemini\\antigravity-ide\\brain\\cf41b621-6791-4928-9b1d-90174a79b704';

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Desktop Game with Hard Mode Enabled
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000?view=game&level=3', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1000));
  // Toggle hard mode
  await page.evaluate(() => {
    localStorage.setItem('arrow_puzzle_hard_mode', 'true');
  });
  await page.goto('http://localhost:3000?view=game&level=3', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(artifactDir, 'desktop_hardmode_view.png') });
  console.log('Captured desktop_hardmode_view.png');

  // Reset back to normal in localStorage
  await page.evaluate(() => {
    localStorage.setItem('arrow_puzzle_hard_mode', 'false');
  });

  await browser.close();
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
