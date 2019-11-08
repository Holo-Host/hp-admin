import React from 'react'
import waait from 'waait'
import { fireEvent, within, act, wait } from '@testing-library/react'
import { renderAndWait } from 'utils/test-utils'
import { HoloFuelApp } from 'root'
import { getAgent } from 'utils/integration-testing/conductorConfig'

jest.mock('react-media-hook')
jest.mock('react-identicon-variety-pack')
jest.unmock('react-router-dom')

// TODO: See below - Determine why the call to whoami isn't completing.
const agentNickname = getAgent().nickname

describe('HOLOFUEL : Sidemenu', () => {
  it('Contains the agent public address', async () => {
    await waait(0)
    const { getByTestId, getByText } = await renderAndWait(<HoloFuelApp />)
    const menuButton = getByTestId('menu-button')

    await act(async () => {
      fireEvent.click(menuButton)
      await waait(0)
    })

    const title = getByTestId('sidemenu-header')
    await wait(() => title)

    expect(within(getByTestId('sidemenu-header')).getByText('HoloFuel')).toBeInTheDocument()

    // TODO: Determine why the call to whoami isn't completing (we only see loading instead...)
    await wait(() => getByText(agentNickname))
  }, 150000)
})
