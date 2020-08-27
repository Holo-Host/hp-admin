const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // Emulates avg desktop viewport
  await page.setViewport({
    width: 1024,
    height: 768,
    deviceScaleFactor: 1,
  });

  await page.goto('http://testfuel.holo.host/');

  // Waits until the `title` meta element is rendered
  await page.waitForSelector('Test Fuel');
  
  const title = await page.title();
  console.info(`The title is: ${title}`);

  await browser.close();
})();
