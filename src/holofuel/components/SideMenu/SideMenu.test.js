import React from 'react'
// import { render } from '@testing-library/react'
import { MockedProvider } from '@apollo/react-testing'

import { renderAndWait } from 'utils/test-utils'
import SideMenu from './SideMenu'

jest.mock('holofuel/contexts/useFlashMessageContext')

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: 'localhost:3100/holofuel/'
  })
}))

describe('SideMenu', () => {
  const props = {
    agent: {}
  }

  it.skip('renders UI Version number', async () => {
    const { getByText } = await renderAndWait(<MockedProvider addTypename={false}>
      <SideMenu {...props} />
    </MockedProvider>)

    const versionText = `UI v${process.env.REACT_APP_VERSION}`
    expect(getByText(versionText)).toBeInTheDocument()
  })
})
