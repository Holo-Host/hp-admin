import { TIMEOUT } from '../utils/global-vars'

describe('Authentication Flow', () => {
    let page;
    beforeAll(async () => {
      page = await global.__BROWSER__.newPage();

      // Emulates avg desktop viewport
      await page.setViewport({
        width: 1024,
        height: 768,
        deviceScaleFactor: 1,
      });
      await page.goto('http://testfuel.holo.host/');
    }, TIMEOUT);
    
    it('should locate the loading text', async () => {      
      const text = await page.evaluate(() => document.body.textContent);
      expect(text).toContain('Connecting to Holo');
    });

    it('should sign in with authentication modal', async () => {
      // Waits until the Sign In text is rendered
      await page.waitForSelector('Sign In');
      
      const text = await page.evaluate(() => document.body.textContent);
      // TODO: Click sign in...
      expect(text).toContain('Sign In');
    });

    it('should locate the title Test Fuel', async () => {
      // Waits until the `title` meta element is rendered
      // TODO: look into **waitForSelector**
      await page.waitForSelector('Test Fuel');

      const title = await page.title();
      console.info(`The title is: ${title}`);
      
      const text = await page.evaluate(() => document.body.textContent);
      expect(text).toContain('Test Fuel');
    });
  },
  TIMEOUT
);