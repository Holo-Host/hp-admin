import React from 'react'
import { fireEvent, wait } from '@testing-library/react'
import { renderAndWait } from 'utils/test-utils'
import { HPAdminApp } from 'root'
import { id } from 'utils/agentConfig'
// import startScenario from '/__integration_tests__/StartScenario.integration.test.js'

jest.mock('react-media-hook')
jest.mock('react-identicon-variety-pack')

describe('CreateRequest', () => {
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
