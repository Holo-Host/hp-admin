import { closeTestConductor, findIframe, addNickname, holoAuthenticateUser, awaitSimpleConsistency } from '../utils/index'
import { orchestrator, conductorConfig } from '../utils/tryorama-integration'
import { TIMEOUT, DNA_INSTANCE, TEST_HOSTS, HOSTED_AGENT } from '../utils/global-vars'
import { presentHolofuelAmount, POLL_INTERVAL } from 'utils'
import wait from 'waait'

orchestrator.registerScenario('Tryorama Runs Create Request e2e', async scenario => {
  let page, hostedAgentInstance, counterpartyAgentInstance
  
  const hostedAgentDetails = {
    // id: 'hhaId::HcScivWRCRMeky9xa7k87tpuF5wnEzy5hOUUTphyIa5kw4i7s5dXyJ7ddrxyahz-holofuel'
    id: '', // hosted agent instanceId
    // agent_address: 'HcScivWRCRMeky9xa7k87tpuF5wnEzy5hOUUTphyIa5kw4i7s5dXyJ7ddrxyahz'
    agent_address: '', // hosted agent address (note: unused in consistency function - remove after modfied in tryorama)
    dna_address: '', // note: unused in consistency function - remove after modfied in tryorama repo
    ...TEST_HOSTS[0]
  }
  
  beforeAll(async () => {
    // use pupeeteer to mock Holo Agent
    page = await global.__BROWSER__.newPage()
    // Emulates avg desktop viewport
    await page.setViewport({
      width: 1024,
      height: 768,
      deviceScaleFactor: 1,
    });
    await page.goto('http://testfuel.holo.host/')
    // await page.goto('http://localhost:3100')

    // use tryorama to mock Counterparty (Holochain) Agent for transactions
    const { [process.env.REACT_APP_TEST_DNA_INSTANCE_ID]: counterpartyAgent } = await scenario.players({ [process.env.REACT_APP_TEST_DNA_INSTANCE_ID]: conductorConfig }, true)
    counterpartyAgentInstance = counterpartyAgent
  }, TIMEOUT)

  afterAll(() => {
    // hostedAgentInstance.close()
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
        const iframe = await findIframe(page, 'chaperone.holo.host')
        await iframe.$('.modal-open')

        const { email, password }  = await holoAuthenticateUser(page, iframe, HOSTED_AGENT.email, HOSTED_AGENT.password, 'signup')
        expect(email).toBe(HOSTED_AGENT.email)
        expect(password).toBe(HOSTED_AGENT.password)

        // TODO: Remove reload page trigger once resolve signIn/refresh after signUp bug..
        await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] })

        // wait for home page to load
        await wait(3000)
        const buttons = await page.$$('button')
        // const menuButton = buttons[2]
        const newTransactionButton = buttons[3]
        newTransactionButton.click()

        // console.log(' >>>>>>>>>>>>>>> buttons : ', buttons)

        // menuButton.click()
        // const sideMenuButtons = await page.$$('SideMenu-module__nav-link___-gvJ_')
        // const inboxButton = sideMenuButtons[0]
        // const historyButton = sideMenuButtons[1]
        // const profileButton = sideMenuButtons[2]
      
      // *********
      // Name Players
      // *********
      // // hosted player updates name
      // profileButton.click() 
      // await page.waitForSelector('form')
      // await frame.type(`input`, 'bobbo', { delay: 100 })
      // await frame.click(`button[type="submit"]`)

      // const nicknameDisplay = await page.$('h3[data-testid="profile-nickname"]')
      // expect(nicknameDisplay).toBe('bobbo')
      
      // await page.click(`div[data-testid="hash-icon"]`)
      // const context = await browser.defaultBrowserContext()
      // await context.overridePermissions('http://testfuel.holo.host/', ['clipboard-read'])
      // const copiedText = await page.evaluate(`(async () => await navigator.clipboard.readText())()`)
      // console.log('------------------- >> Copied USER HASH : ', copiedText)
      
      // // use tryorama to mock Host (Holochain) Agent to montior DHT consistency
      // hostedAgentDetails.agent_address = copiedText
      // hostedAgentDetails.id = `hha::${copiedText}-${DNA_INSTANCE}`
      // hostedAgentInstance = await scenario.hostedPlayers(hostedAgentDetails)

      // wait for DHT consistency
      // await awaitSimpleConsistency(scenario, DNA_INSTANCE, [counterpartyAgentInstance], [hostedAgentInstance])

      // // counterparty updates name
      // addNickname(scenario, counterpartyAgentInstance, 'Alice')
   
      // wait for DHT consistency
      // await awaitSimpleConsistency(scenario, DNA_INSTANCE, [counterpartyAgentInstance], [hostedAgentInstance])
      
      // *********
      // Create New Request
      // *********
        // menuButton.click()
        // inboxButton.click()
        
        newTransactionButton.click()
        console.log(' >>>>>>>>>>>>>>> newTransactionButton : ', newTransactionButton)

        // await page.waitForSelector('button.AmountInput-module__numpad-button___2L0x3')
        // const numpadButtons = await page.$$('button.AmountInput-module__numpad-button___2L0x3')        
        // numpadButtons[0].click()
        // numpadButtons[1].click()
        // numpadButtons[2].click()
        // numpadButtons[9].click()
        // numpadButtons[3].click()
        // numpadButtons[4].click()
        // numpadButtons[5].click()
        
        // await wait(1000)

        // const actionButtons = await page.$$('button.AmountInput-module__action-button___HfE-d.UIButton-module__button___2eLXd.UIButton-module__white___3J1jF')
        // const requestButton = actionButtons[1]
        // requestButton.click()
        
        // await page.waitForSelector('form')

        // const conterpartyAgentAddress = counterpartyAgentInstance.info(DNA_INSTANCE).agentAddress
        // const newOffer = {
        //     amount: '123.456',
        //     counterpartyId: conterpartyAgentAddress,
        //     note: 'Taco Tuesday!'
        //   }

        //   await frame.type(`#counterpartyId`, newOffer.counterpartyId, { delay: 10 })
        //   await frame.type(`#note`, newOffer.note, { delay: 100 })

        //   const amount = await frame.$eval(`input[data-testid="amount-input"]`, el => el.value)
        //   const counterpartyId = await frame.$eval(`#counterpartyId`, el => el.value)
        //   const note = await frame.$eval(`#notes`, el => el.value)

        //   expect(amount).toBe(newOffer.amount)
        //   expect(counterpartyId).toBe(newOffer.counterpartyId)
        //   expect(note).toEqual(newOffer.note)

        //   // wait for button to not be disabled
        //   await wait(500)

        //   const submitButton = await page.$('button[data-testid="submit-button"]')
        //   console.log('++++++++++=', submitButton)
        //   submitButton.click()

        // wait for DHT consistency
        // await awaitSimpleConsistency(scenario, DNA_INSTANCE, [counterpartyAgentInstance], [hostedAgentInstance])

          // menuButton.click()
          // historyButton.click()

  //     // *********
  //     // Check History
  //     // *********
  //     await page.waitForSelector('div.TransactionHistory-module__filter-button___31JRc TransactionHistory-module__selected___4WxOY')
  //     await waait(POLL_INTERVAL)

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
