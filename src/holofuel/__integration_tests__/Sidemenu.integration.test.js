import React from 'react'
import { fireEvent, wait } from '@testing-library/react'
import { renderAndWait } from 'utils/test-utils'
import { HoloFuelApp } from 'root'
import { getAgent } from 'utils/integration-testing/conductorConfig'

jest.mock('react-media-hook')
jest.mock('react-identicon-variety-pack')

const agentNickname = getAgent().nickname

describe('HOLOFUEL : Sidemenu', () => {
  it('Contains the agent public address', async () => {
    console.log('6')

    const { getByTestId, getByText } = await renderAndWait(<HoloFuelApp />)
    const menuButton = getByTestId('menu-button')
    fireEvent.click(menuButton)

    await wait(() => getByText('HoloFuel'))
    await wait(() => getByText(agentNickname))
  }, 20000)
})
