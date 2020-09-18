import { closeTestConductor, findIframe, waitLoad, holoAuthenticateUser, awaitSimpleConsistency, waitZomeResult } from '../utils/index'
import { orchestrator, conductorConfig } from '../utils/tryorama-integration'
import { TIMEOUT, HAPP_URL, DNA_INSTANCE, HHA_ID, TEST_HOSTS, HOSTED_AGENT } from '../utils/global-vars'
import { CHAPERONE_SERVER_URL } from 'src/holochainClient'
// import { presentHolofuelAmount, POLL_INTERVAL } from 'utils'
import wait from 'waait'
import _ from 'lodash'

orchestrator.registerScenario('Tryorama Runs Create Request e2e', async scenario => {
  let page, hostedAgentInstance, counterpartyAgentInstance, wsConnected, completeFirstGet, frameLoaded
  const outstandingRequestIds = []

  const hostedAgentDetails = {
    id: `${HHA_ID}::HcSCJp5QzG5EG7yivgCTXBogaHxq8widw488MRBp7oBkMhhnQbJ57KQ9cdQtwmr-${DNA_INSTANCE}`, // hosted agent instanceId
    agent_address: 'HcSCJp5QzG5EG7yivgCTXBogaHxq8widw488MRBp7oBkMhhnQbJ57KQ9cdQtwmr', // hosted agent address (note: not needed in consistency function - remove after modfied in tryorama)
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
      deviceScaleFactor: 1,
    });
    await page.goto(HAPP_URL)

    const client = page._client
    client.on('Network.webSocketFrameSent', ({ response }) => {
      wsConnected = !!response
      const callId = JSON.parse(response.payloadData).id
      outstandingRequestIds.push(callId)
      if (callId === 8) {
        completeFirstGet = false
      }
    })
    client.on('Network.webSocketFrameReceived', ({ response }) => {
      const callId = JSON.parse(response.payloadData).id
      _.remove(outstandingRequestIds, id => id === callId)
      if (callId === 8) {
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

  describe('Create Request Flow e2e', () => {
    it('All endpoints work e2e with DNA', async () => {
      // *********
      // Log into hApp
      // *********
        // wait for the modal to load
        await wait(4000)

        await page.waitForSelector('iframe')
        const iframe = await findIframe(page, CHAPERONE_SERVER_URL)
        await iframe.$('.modal-open')

        const { email, password }  = await holoAuthenticateUser(page, iframe, HOSTED_AGENT.email, HOSTED_AGENT.password, 'signup')
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
        await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] })

        await wait(3000)
        const buttons = await page.$$('button')
        const menuButton = buttons[0]
        const newTransactionButton = buttons[3]

        await waitLoad(() => wsConnected)
        await waitLoad(() => completeFirstGet)

        menuButton.click()

        await wait (4000)
        const sideMenuButtons = await page.$$('.SideMenu-module__nav-link___-gvJ_')
        const inboxButton = sideMenuButtons[0]
        // const historyButton = sideMenuButtons[1]

      // wait for DHT consistency
      await awaitSimpleConsistency(scenario, DNA_INSTANCE, [counterpartyAgentInstance], [hostedAgentInstance])

      // *********
      // Create New Request
      // *********
      menuButton.click()
      newTransactionButton.click()
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

      const submitButton = await page.$('button[data-testid="submit-button"]')
      submitButton.click()

      // // wait for DHT consistency
      await awaitSimpleConsistency(scenario, DNA_INSTANCE, [counterpartyAgentInstance], [hostedAgentInstance])

      const checkListPending = async () => await counterpartyAgentInstance.call('holofuel', 'transactions', 'list_pending', {});
      const listPending = await waitZomeResult(checkListPending, 90000, 10000)

      console.log('isConsistent...', isConsistent)
      expect(listPending.requests.length).toEqual(1)

      // await wait(3000)
      // menuButton.click()
      // await wait(2000)
      // historyButton.click()

      // // *********
      // // Check History
      // // *********
      // await wait(1000)

      // await page.waitForSelector('div.TransactionHistory-module__filter-button___31JRc TransactionHistory-module__selected___4WxOY')
      // await wait(POLL_INTERVAL)

      // await page.waitForSelector('div[data-testid="transaction-row"]')
      // const transactionRows = await page.$$('div[data-testid="transaction-row"]')
      // const mostRecentTransaction = transactionRows[0]

      // const transactionData = await page.evaluate(mostRecentTransaction => mostRecentTransaction.innerHTML, mostRecentTransaction)
      // expect(transactionData).toContain(newOffer.counterpartyId)
      // expect(transactionData).toContain(`+ ${presentHolofuelAmount(newOffer.amount)}`)
      // expect(transactionData).toContain(newOffer.note)
    })
  })
})

orchestrator.run()
