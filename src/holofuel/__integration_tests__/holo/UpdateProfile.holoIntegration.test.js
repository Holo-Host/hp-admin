import { closeTestConductor, findIframe, waitLoad, addNickname, holoAuthenticateUser, simpleConsistency, waitZomeResult } from '../utils/index'
import { orchestrator, conductorConfig } from '../utils/tryorama-integration'
import { TIMEOUT, HAPP_URL, HHA_ID, DNA_INSTANCE, TEST_HOSTS, HOSTED_AGENT } from '../utils/global-vars'
import { PRODUCTION_CHAPERONE_SERVER_URL } from 'src/holochainClient'
import wait from 'waait'
import _ from 'lodash'

orchestrator.registerScenario('Tryorama Runs Create Request e2e', async scenario => {
  let page, hostedAgentInstance, counterpartyAgentInstance, wsConnected, completeFirstGet
  const outstandingRequestIds = []

  const hostedAgentDetails = {
    id: '',
    agent_address: '',
    dna_address: '',
    ...TEST_HOSTS[0]
  }

  beforeAll(async () => {
    // use tryorama to mock Counterparty (Holochain) Agent for transactions
    const { [process.env.REACT_APP_TEST_DNA_INSTANCE_ID]: counterpartyAgent } = await scenario.players({ [process.env.REACT_APP_TEST_DNA_INSTANCE_ID]: conductorConfig }, true)
    counterpartyAgentInstance = counterpartyAgent

    // BUG: - Unable to override permissions in this context.  We need to override permissions to read the clipboard.
    // await global.__BROWSER__.defaultBrowserContext().overridePermissions(HAPP_URL, ['clipboard-read'])

    // use pupeeteer to mock Holo Agent
    page = await global.__BROWSER__.newPage()
    // Emulates avg desktop viewport
    await page.setViewport({
      width: 1024,
      height: 768,
      deviceScaleFactor: 1
    })
    await page.goto(HAPP_URL)

    const client = page._client
    client.on('Network.webSocketFrameSent', ({ response }) => {
      wsConnected = !!response
      const callId = JSON.parse(response.payloadData).id
      outstandingRequestIds.push(callId)
      if (callId === 5) {
        completeFirstGet = false
      }
    })
    client.on('Network.webSocketFrameReceived', ({ response }) => {
      const callId = JSON.parse(response.payloadData).id
      _.remove(outstandingRequestIds, id => id === callId)
      if (callId === 5) {
        completeFirstGet = true
      }
    })
  }, TIMEOUT)

  afterAll(() => {
    if (hostedAgentInstance) {
      hostedAgentInstance.close()
    }
    closeTestConductor(counterpartyAgentInstance, 'Create Request e2e')
  })

  describe.skip('Create Request Flow e2e', () => {
    it('All endpoints work e2e with DNA', async () => {
      // *********
      // Log into hApp
      // *********
      // wait for the modal to load
      await wait(4000)

      await page.waitForSelector('iframe')
      const iframe = await findIframe(page, PRODUCTION_CHAPERONE_SERVER_URL)
      await iframe.$('.modal-open')

      const { email, password } = await holoAuthenticateUser(page, iframe, HOSTED_AGENT.email, HOSTED_AGENT.password, 'signup')
      expect(email).toBe(HOSTED_AGENT.email)
      expect(password).toBe(HOSTED_AGENT.password)

      // wait for home page to load
      await wait(3000)
      const headers = await page.$$('h1')
      const title = headers[0]
      const appTitle = await page.evaluate(title => title.innerHTML, title)
      expect(appTitle).toBe('Test Fuel')

      // wait for home page to reload
      // TODO: Remove reload page trigger and timeout once resolve signIn/refresh after signUp bug..
      await page.reload({ waitUntil: ['networkidle0', 'domcontentloaded'] })

      const buttons = await page.$$('button')
      const menuButton = buttons[0]

      await waitLoad(() => wsConnected)
      await waitLoad(() => completeFirstGet)

      menuButton.click()

      await wait(4000)
      const sideMenuButtons = await page.$$('.SideMenu-module__nav-link___-gvJ_')
      const profileButton = sideMenuButtons[2]

      // *********
      // Name Players
      // *********
      // hosted player updates name
      profileButton.click()

      await wait(1000)
      await page.waitForSelector('form')
      const input = await page.$('input')
      // click the target field 3 times so that the browser selects all the text in input box
      await input.click({ clickCount: 3 })
      await page.type('input', 'bobbo naut', { delay: 100 })
      await page.click(`button[type="submit"]`)

      const nicknameDisplay = await page.$eval('h3[data-testid="profile-nickname"]', el => el.innerHTML)
      expect(nicknameDisplay).toBe('bobbo naut')

      // await page.click(`div[data-testid='hash-icon']`)
      // const copiedText = await page.evaluate(`(async () => await navigator.clipboard.readText())()`)
      // Note: Hard coding the user hash for now, as permission issues persist with reading clipboard
      const copiedText = 'HcSCiq5N5p3887vKvj4SoVqKnssnufn9shmd7jMs593T398tr6649vy5Ozavwnr'

      // use tryorama to mock Host (Holochain) Agent to montior DHT consistency
      hostedAgentDetails.agent_address = copiedText
      hostedAgentDetails.id = `${HHA_ID}::${copiedText}-${DNA_INSTANCE}`
      hostedAgentInstance = await scenario.hostedPlayers(hostedAgentDetails)

      console.log('hostedAgentInstance : ', hostedAgentInstance)

      // wait for DHT consistency
      console.log('Waiting for consistency...')
      await simpleConsistency(scenario, DNA_INSTANCE, [counterpartyAgentInstance], [hostedAgentInstance])

      console.log('Call to Holochain Player get_profile for hosted agent...')
      let isMyProfileConsistent = false
      const checkHostedProfile = await counterpartyAgentInstance.call('holofuel', 'profile', 'get_profile', { agent_address: hostedAgentDetails.agent_address })
      const profile = await waitZomeResult(checkHostedProfile, 90000, 10000)
      if (profile.nickname && profile.nickname === 'bobbo naut') {
        isMyProfileConsistent = true
      }

      expect(isMyProfileConsistent).toBe(true)

      // counterparty updates name
      addNickname(scenario, counterpartyAgentInstance, 'Alice')

      // wait for DHT consistency
      console.log('Waiting for consistency...')
      let isCounterpartyProfileConsistent = false
      await simpleConsistency(scenario, DNA_INSTANCE, [counterpartyAgentInstance], [hostedAgentInstance])
      isCounterpartyProfileConsistent = true

      expect(isCounterpartyProfileConsistent).toBe(true)
      console.log('------------ END OF PROFILE TEST ------------')

      // *********
      // Sign Out
      // *********
      const SignOutButton = await page.waitForSelector('button.Header-module__signout-button___1EkW_')
      // TODO: Remove duplicate click once resolve double-click bug...
      SignOutButton.click()
      SignOutButton.click()
    })
  })
})

orchestrator.run()
