import { closeTestConductor, findIframe, waitLoad, holoAuthenticateUser, simpleConsistency, waitZomeResult } from '../utils/index'
import { orchestrator, conductorConfig } from '../utils/tryorama-integration'
import { TIMEOUT, HAPP_URL, DNA_INSTANCE, HHA_ID, TEST_HOSTS, HOSTED_AGENT } from '../utils/global-vars'
import { PRODUCTION_CHAPERONE_SERVER_URL } from 'src/holochainClient'
import wait from 'waait'
import _ from 'lodash'

orchestrator.registerScenario('Tryorama Runs Create Request e2e', async scenario => {
  let page, hostedAgentInstance, counterpartyAgentInstance, wsConnected, completeFirstGet
  const outstandingRequestIds = []

  const hostedAgentDetails = {
    id: `${HHA_ID}::HcScIsBM74Uuwinkw9WcByIKrdrecjhm75XfAjMb8gOt7szsfOaX7msgPjc97ir-${DNA_INSTANCE}`, // hosted agent instanceId
    agent_address: 'HcScIsBM74Uuwinkw9WcByIKrdrecjhm75XfAjMb8gOt7szsfOaX7msgPjc97ir', // hosted agent address (note: not needed in consistency function - remove after modfied in tryorama)
    dna_address: '', // note: unused in consistency function - remove after modfied in tryorama repo
    ...TEST_HOSTS[0]
  }

  beforeAll(async () => {
    // use tryorama to mock Counterparty (Holochain) Agent for transactions
    const { [process.env.REACT_APP_TEST_DNA_INSTANCE_ID]: counterpartyAgent } = await scenario.players({ [process.env.REACT_APP_TEST_DNA_INSTANCE_ID]: conductorConfig }, true)
    counterpartyAgentInstance = counterpartyAgent

    // use tryorama to monitor Hosted agent DHT consistency (via Host (Holochain) Agent)
    hostedAgentInstance = await scenario.hostedPlayers(hostedAgentDetails)

    // use pupeeteer to mock Holo Hosted Agent Actions
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
      if (callId === 28) {
        completeFirstGet = false
      }
      // console.log('NETWORK FRAME SENT >>> : ', JSON.parse(response.payloadData))
    })
    client.on('Network.webSocketFrameReceived', ({ response }) => {
      const callId = JSON.parse(response.payloadData).id
      _.remove(outstandingRequestIds, id => id === callId)
      if (callId === 28) {
        completeFirstGet = true
      }
      // console.log('NETWORK RESPONSE <<< : ', JSON.parse(response.payloadData))
    })
  }, TIMEOUT)

  afterAll(() => {
    if (hostedAgentInstance) {
      hostedAgentInstance.close()
    }
    closeTestConductor(counterpartyAgentInstance, 'Create Request e2e')
  })

  describe('Create Request Flow e2e', () => {
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

      await wait(5000)
      const newTransactionButton = await page.waitForSelector('button.Inbox-module__new-transaction-button___1gFQD.UIButton-module__button___2eLXd.UIButton-module__green___11ET2')
      newTransactionButton.click()

      await waitLoad(() => wsConnected)
      await waitLoad(() => completeFirstGet)

      // wait for DHT consistency
      console.log('Waiting for consistency...')
      await simpleConsistency(scenario, DNA_INSTANCE, [counterpartyAgentInstance], [hostedAgentInstance])

      // *********
      // Create New Request
      // *********
      await page.waitForSelector('button.AmountInput-module__numpad-button___2L0x3')
      const numpadButtons = await page.$$('button.AmountInput-module__numpad-button___2L0x3')
      numpadButtons[0].click()
      await wait(100)
      numpadButtons[1].click()
      await wait(100)
      numpadButtons[2].click()
      await wait(100)
      numpadButtons[9].click()
      await wait(100)
      numpadButtons[3].click()
      await wait(100)
      numpadButtons[4].click()
      await wait(100)
      numpadButtons[5].click()
      await wait(100)

      await wait(1000)

      const actionButtons = await page.$$('button.AmountInput-module__action-button___HfE-d.UIButton-module__button___2eLXd.UIButton-module__white___3J1jF')
      const requestButton = actionButtons[1]
      requestButton.click()

      await wait(1000)
      await page.waitForSelector('form')

      const conterpartyAgentAddress = counterpartyAgentInstance.info(DNA_INSTANCE).agentAddress
      const newOffer = {
        amount: '123.456',
        counterpartyId: conterpartyAgentAddress,
        note: 'Taco Tuesday!'
      }

      await page.type(`#counterpartyId`, newOffer.counterpartyId, { delay: 10 })
      await page.type(`#notes`, newOffer.note, { delay: 100 })

      const amount = await page.$eval(`div.CreateOfferRequest-module__amount___YdE2C`, el => el.innerHTML)
      const counterpartyId = await page.$eval(`#counterpartyId`, el => el.value)
      const note = await page.$eval(`#notes`, el => el.value)

      expect(amount).toContain(newOffer.amount)
      expect(counterpartyId).toBe(newOffer.counterpartyId)
      expect(note).toEqual(newOffer.note)

      // wait for button to not be disabled
      await wait(1000)

      // verify that counterparty list_pending is 0 prior to request submission
      console.log('Call to Holochain Player list_pending (first time)...')
      const checkListPending = async () => counterpartyAgentInstance.call('holofuel', 'transactions', 'list_pending', {})
      const listPendingPrior = await waitZomeResult(checkListPending, 90000, 10000)
      expect(listPendingPrior.requests.length).toEqual(0)

      // submit request
      const submitButton = await page.$("button[data-testid='submit-button']")
      submitButton.click()

      console.log('Waiting for consistency...')
      // // wait for DHT consistency
      await simpleConsistency(scenario, DNA_INSTANCE, [counterpartyAgentInstance], [hostedAgentInstance])

      // verify that counterparty list_pending is 1 after request submission
      console.log('Call to Holochain Player list_pending (second time)...')
      const listPendingAfter = await waitZomeResult(checkListPending, 90000, 10000)
      expect(listPendingAfter.requests.length).toEqual(1)

      console.log('------------ END OF REQUEST TEST ------------')

      // *********
      // Sign Out
      // *********
      const SignOutButton = await page.waitForSelector('button.Header-module__signout-button___1EkW_')
      // clicking once to get outside of info modal.
      SignOutButton.click()
      // TODO: Remove duplicate click once resolve double-click bug...
      SignOutButton.click()
      SignOutButton.click()
    })
  })
})

orchestrator.run()
