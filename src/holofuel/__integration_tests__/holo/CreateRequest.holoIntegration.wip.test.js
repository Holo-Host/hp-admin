import React from 'react'
import { fireEvent, act, waitFor } from '@testing-library/react'
import waait from 'waait'
import { presentHolofuelAmount, POLL_INTERVAL } from 'utils'
import { renderAndWait } from 'utils/unit-test-utils'
import { HolofuelApp } from 'root'
import { closeTestConductor, addNickname, hostLogin } from '../utils/index'
import { orchestrator, conductorConfig } from '../utils/tryorama-integration'
import { DNA_INSTANCE } from '../utils/global-vars'

jest.mock('react-media-hook')
jest.mock('react-identicon-variety-pack')
jest.unmock('react-router-dom')

orchestrator.registerScenario('Tryorama Runs Create Request Scenario', async scenario => {
  let agent1Instance, agent2Instance
  beforeEach(async () => {
    const { [process.env.REACT_APP_TEST_DNA_INSTANCE_ID]: agent1, agent2 } = await scenario.players({[process.env.REACT_APP_TEST_DNA_INSTANCE_ID]: conductorConfig, agent2: conductorConfig}, true)
    agent1Instance = agent1
    agent2Instance = agent2
    return { agent1, agent2 }
  })
  afterEach(() => closeTestConductor(agent1Instance, 'Create Request'))
  describe('Create Request Flow', () => {
    it('All endpoints work e2e with DNA', async () => {
      const agent1Nickname = 'Alice'
      const agent2Nickname = 'Bob'
      addNickname(scenario, agent1Instance, agent1Nickname)
      addNickname(scenario, agent2Instance, agent2Nickname)  
      
      const newOffer = {
        counterpartyId: agent2Instance.info(DNA_INSTANCE).agentAddress,
        amount: '123.6554',
        note: 'Taco Tuesday!'
      }

      const queries = await renderAndWait(<HolofuelApp />)
      const { getByText, getAllByText, getByLabelText, getByTestId, debug } = queries

      // *********
      // Log into hApp (if in hosted version)
      // *********      
      if (process.env.REACT_APP_HOSTED_HAPP === 'true') {
        debug()
        const email = 'an@example.com'
        const password = 'my1stPasswordRocks!'

        await waitFor(() => getByText('Login with Holo'))
        const result = await hostLogin(queries, email, password)
        console.log(result)
      }

      // wait for the page load
      await waitFor(() => getByText('Holofuel'))

      // *********
      // Create New Request
      // *********
      fireEvent.click(getByText('New Transaction'))
      fireEvent.click(getAllByText('Request')[0])

      expect(getByTestId('submit-button')).toBeDisabled()
      
      act(() => { 
        fireEvent.change(getByTestId('amount-input'), { target: { value: newOffer.amount } })
        fireEvent.change(getByLabelText('From:'), { target: { value: newOffer.counterpartyId } })
        fireEvent.change(getByLabelText('For:'), { target: { value: newOffer.note } })
      })

      await waitFor(() => expect(getByTestId('submit-button')).not.toBeDisabled())

      await act(async () => {
        fireEvent.click(getByTestId('submit-button'))
        await waait(2500)
      })

      // wait for conductor to sync with update to dht
      await act(async () => await scenario.consistency())

      // *********
      // Check History
      // *********
      fireEvent.click(getByText('History'))

      await act(async () => {
        await agent1Instance.callSync(DNA_INSTANCE, "transactor", "get_pending_transactions", {})
        await waait(POLL_INTERVAL)
      })

      expect(getByText(agent2Nickname)).toBeInTheDocument()
      expect(getByText(`+ ${presentHolofuelAmount(newOffer.amount)}`)).toBeInTheDocument()
      expect(getByText(newOffer.note)).toBeInTheDocument()
    })
  })
})

orchestrator.run()