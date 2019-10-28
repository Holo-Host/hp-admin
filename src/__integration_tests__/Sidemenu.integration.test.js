import React from 'react'
import { fireEvent, wait } from '@testing-library/react'
import { renderAndWait } from 'utils/test-utils'
import { HoloFuelApp } from 'root'
import { nickname } from 'utils/agentConfig'

jest.mock('react-media-hook')
jest.mock('react-identicon-variety-pack')

describe('Sidemenu', () => {
  it('Contains the agent public address', async () => {
    const { getByTestId, getByText } = await renderAndWait(<HoloFuelApp />)
    const menuButton = getByTestId('menu-button')
    fireEvent.click(menuButton)
    await wait(() => getByText(nickname))
  }, 20000)
})
