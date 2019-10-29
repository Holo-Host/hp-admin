import React from 'react'
import runConductor from '/__integration_test__/RunConductor.integration.test.js'
import { fireEvent, wait } from '@testing-library/react'
import { renderAndWait } from 'utils/test-utils'
import { HPAdminApp } from 'root'
// import { id } from 'utils/agentConfig'

jest.mock('react-media-hook')
jest.mock('react-identicon-variety-pack')

const runScenario = (callZome) => {
  console.log('CALLZOME : ', callZome)

  describe('TESTING => Hosting Navigation Integration Test', () => {
    it('user can create a request and then view it in the transaction history', async () => {
      const amount = 123

      const { getByTestId, getByText, getByLabelText } = await renderAndWait(<HPAdminApp />)
      fireEvent.click(getByTestId('menu-button'))
      await wait(() => getByText('Request'))

      fireEvent.click(getByText('Request'))

      await wait(() => getByLabelText('From'))
      // request from ourselves
      fireEvent.change(getByLabelText('From'), { target: { value: id } })
      fireEvent.change(getByLabelText('Amount'), { target: { value: amount } })
      fireEvent.click(getByText('Send'))

      await wait(() => getByLabelText('History'))
    }, 20000)
  })
}

runConductor(runScenario)
