import waait from 'waait'
import { closeTestConductor, addNickname, holoLogin } from '../utils/index'
import { orchestrator, conductorConfig } from '../utils/tryorama-integration'
import { DNA_INSTANCE, TEST_HOSTS, HOSTED_AGENT } from '../utils/global-vars'
import { presentHolofuelAmount, POLL_INTERVAL } from 'utils'

jest.mock('react-media-hook')
jest.mock('react-identicon-variety-pack')
jest.unmock('react-router-dom')

orchestrator.registerScenario('Tryorama Runs Create Request Scenario', async scenario => {
  let page, agent1Instance, agent2Instance

  const hostedAgentDetails = {
    id: 'holofuel', // hosted agent instance_id
    agent_address: 'HcScivWRCRMeky9xa7k87tpuF5wnEzy5hOUUTphyIa5kw4i7s5dXyJ7ddrxyahz', //hosted agent address
    dna_address: "QmUnUf3J49qv3ujzYAVEWXC6WZZsQTgm3KvtYAMJDZ4Z2P", // we shouldn't need the dna hash as well - remove after modfied in tryorama repo
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
    // await page.goto('http://testfuel.holo.host/')
    await page.goto('http://localhost:3100')

    // use tryorama to mock Holochain Agent and montior DHT consistency
    const { [process.env.REACT_APP_TEST_DNA_INSTANCE_ID]: agent1 } = await scenario.players({[process.env.REACT_APP_TEST_DNA_INSTANCE_ID]: conductorConfig, agent2: conductorConfig}, true)
    const agent2 = await s.hostedPlayers(hostedAgentDetails)
    agent1Instance = agent1
    agent2Instance = agent2
    return { agent1, agent2 }
  }, TIMEOUT)
  afterAll(() => closeTestConductor(agent1Instance, 'Create Request'))
  describe('Create Request Flow', () => {
    test('works', () => {
      expect(2).toEqual(2)
    })

    it.skip('All endpoints work e2e with DNA', async (done) => {
      const agent1Nickname = 'Alice'


      
      const newOffer = {
        counterpartyId: agent2Instance.info(DNA_INSTANCE).agentAddress,
        amount: '123.6554',
        note: 'Taco Tuesday!'
      }

      // *********
      // Name Players
      // *********
      addNickname(scenario, agent1Instance, agent1Nickname)
      addNickname(scenario, agent2Instance, agent2Nickname)  
      
      // wait for DHT consistency
      if (!await scenario.simpleConsistency("app", [agent1Instance, agent2Instance])) {
        done.fail("failed to reach consistency")
      }

      // *********
      // Log into hApp
      // *********
        // Note: NEED TO WAIT FOR AUTH MODAL TO LOAD
      
        // wait for the modal to load
        const text = await page.evaluate(() => document.body.textContent);
        await text.toContain('Login with Holo')

        const result = await holoLogin(HOSTED_AGENT.email, HOSTED_AGENT.password)
        console.log(result)

        
  //     // *********
  //     // Create New Request
  //     // *********

  //     // wait for the page load
  //     await waitFor(() => getByText('Holofuel'))

  //     fireEvent.click(getByText('New Transaction'))
  //     fireEvent.click(getAllByText('Request')[0])

  //     expect(getByTestId('submit-button')).toBeDisabled()
      
  //     act(() => { 
  //       fireEvent.change(getByTestId('amount-input'), { target: { value: newOffer.amount } })
  //       fireEvent.change(getByLabelText('From:'), { target: { value: newOffer.counterpartyId } })
  //       fireEvent.change(getByLabelText('For:'), { target: { value: newOffer.note } })
  //     })

  //     await waitFor(() => expect(getByTestId('submit-button')).not.toBeDisabled())

  //     await act(async () => {
  //       fireEvent.click(getByTestId('submit-button'))
  //       await waait(2500)
  //     })

  //     // wait for conductor to sync with update to dht
  //     await act(async () => await scenario.consistency())

  //     // *********
  //     // Check History
  //     // *********
  //     fireEvent.click(getByText('History'))

  //     await act(async () => {
  //       await agent1Instance.callSync(DNA_INSTANCE, "transactor", "get_pending_transactions", {})
  //       await waait(POLL_INTERVAL)
  //     })

  //     expect(getByText(agent2Nickname)).toBeInTheDocument()
  //     expect(getByText(`+ ${presentHolofuelAmount(newOffer.amount)}`)).toBeInTheDocument()
  //     expect(getByText(newOffer.note)).toBeInTheDocument()
    })
  })
})

orchestrator.run()