import { TIMEOUT, HOSTED_AGENT, HAPP_URL } from '../utils/global-vars'
import { findIframe, holoAuthenticateUser, takeSnapshot } from '../utils/index'
import { CHAPERONE_SERVER_URL } from 'src/holochainClient'
import wait from 'waait'

describe('Authentication Flow', () => {
  let page
  beforeAll(async () => {
    page = await global.__BROWSER__.newPage()

    // Emulates avg desktop viewport
    await page.setViewport({
      width: 1024,
      height: 768,
      deviceScaleFactor: 1
    })
    await page.goto(HAPP_URL)
  }, TIMEOUT)

  it('should locate the loading text', async () => {
    const pageContent = await page.$eval('#root', el => el.innerHTML)
    await takeSnapshot(page, 'loadingPage')
    expect(pageContent).toContain('Connecting to the Holo network')
  })

  it('should successfully sign up and sign out', async () => {
    // *********
    // Sign Up and Log Into hApp
    // *********
    // wait for the modal to load
    await wait(5000)
    await page.waitForSelector('iframe')

    const iframe = await findIframe(page, CHAPERONE_SERVER_URL)
    const modalData = await iframe.$eval('.modal-open', el => el.innerHTML)
    expect(modalData).toContain('Login with Holo')
    expect(modalData).toContain('Sign Up')

    const { email, password, confirmation } = await holoAuthenticateUser(page, iframe, HOSTED_AGENT.email, HOSTED_AGENT.password, 'signup')

    expect(email).toBe(HOSTED_AGENT.email)
    expect(password).toBe(HOSTED_AGENT.password)
    expect(confirmation).toEqual(password)

    await takeSnapshot(page, 'afterSignupScreen')

    // *********
    // Evaluate Home Page
    // *********
    // wait for home page to load
    await wait(5000)
    const headers = await page.$$('h1')
    const title = headers[0]

    await wait(2000)
    await takeSnapshot(page, 'homePage')

    const appTitle = await page.evaluate(title => title.innerHTML, title)
    expect(appTitle).toBe('Test Fuel')

    // *********
    // Sign Out
    // *********
    const button = await page.$$('button')
    const SignOutButton = button[1]
    // TODO: Remove duplicate click once resolve double-click bug...
    SignOutButton.click()
    SignOutButton.click()

    await wait(1000)
    await takeSnapshot(page, 'afterSignoutModal')

    const newIframe = await findIframe(page, CHAPERONE_SERVER_URL)
    const newModalData = await newIframe.$eval('.modal-open', el => el.innerHTML)
    expect(newModalData).toContain('Login with Holo')
  })
}, TIMEOUT)