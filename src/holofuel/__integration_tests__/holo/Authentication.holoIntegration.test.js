import { TIMEOUT, SCREENSHOT_PATH, HOSTED_AGENT } from '../utils/global-vars'
import { findIframe, holoAuth } from '../utils/index'
import wait from 'waait';

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
      const pageContent = await page.$eval('#root', el => el.innerHTML)
      await page.screenshot({path: SCREENSHOT_PATH + '/loadingPage.png'});
      expect(pageContent).toContain('Connecting to Holo');
    });

    it('should successfully sign up and sign out', async () => {
      // wait for the modal to load
      await wait(5000)
      await page.waitForSelector('iframe')

      const iframe = await findIframe(page, 'chaperone.holo.host')
      const modalData = await iframe.$eval('.modal-open', el => el.innerHTML)
      expect(modalData).toContain('Login with Holo')
      expect(modalData).toContain('Sign Up')

      const takeSnapshot = async () => await page.screenshot({path: SCREENSHOT_PATH + '/signUpModal.png'})
      const { email, password, confirmation }  = await holoAuth(iframe, HOSTED_AGENT.email, HOSTED_AGENT.password, 'signup', { asyncCallback: takeSnapshot() })

      // await iframe.click('button[onclick="showSignUp()"]')
      // await iframe.type('#signup-email', HOSTED_AGENT.email, { delay: 100 })
      // await iframe.type('#signup-password', HOSTED_AGENT.password, { delay: 100 })
      // await iframe.type('#signup-password-confirm', HOSTED_AGENT.password, { delay: 100 })

      // await page.screenshot({path: SCREENSHOT_PATH + '/signUpModal.png'})

      // const email = await iframe.$eval('#signup-email', el => el.value)
      // const password = await iframe.$eval('#signup-password', el => el.value)
      // const confirmation = await iframe.$eval('#signup-password-confirm', el => el.value)
      expect(email).toBe(HOSTED_AGENT.email)
      expect(password).toBe(HOSTED_AGENT.password)
      expect(confirmation).toEqual(password)
      
      // let button
      // button = await iframe.$$('button[onclick="formSubmit()"]')
      // const SignUpButton = button[1]
      // SignUpButton.click()

      await page.screenshot({path: SCREENSHOT_PATH + '/afterSignUp.png'})

      // TODO: Remove reload page trigger once resolve signIn/refresh after signUp bug..
      await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] })

      // wait for home page to load
      await wait(5000)
      const header = await page.$$('h1')
      const title = header[0]

      await page.screenshot({path: SCREENSHOT_PATH + '/homePage.png'})

      const appTitle = await page.evaluate(title => title.innerHTML, title);
      expect(appTitle).toBe('Test Fuel')

      const button = await page.$$('button')
      const SignOutButton = button[1]
      // TODO: Remove duplicate click once resolve double-click bug...
      SignOutButton.click()
      SignOutButton.click()

      await wait(1000)
      await page.screenshot({path: SCREENSHOT_PATH + '/afterSignOut.png'})

      const newIframe = await findIframe(page, 'chaperone.holo.host')
      const newModalData = await newIframe.$eval('.modal-open', el => el.innerHTML)
      expect(newModalData).toContain('Login with Holo')
    });
  }, TIMEOUT);
  