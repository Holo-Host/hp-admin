import React from 'react'
import { fireEvent, wait } from '@testing-library/react'
import { renderAndWait } from 'utils/test-utils'
import { HoloFuelApp } from 'root'
import { getAgent } from 'utils/conductorConfig'

jest.mock('react-media-hook')
jest.mock('react-identicon-variety-pack')

const agentNickname = getAgent().nickname

describe('Sidemenu', () => {
  it('Contains the agent public address', async () => {
    const { getByTestId, getByText } = await renderAndWait(<HoloFuelApp />)
    const menuButton = getByTestId('menu-button')
    fireEvent.click(menuButton)
    await wait(() => getByText(agentNickname))
  }, 20000)
})
