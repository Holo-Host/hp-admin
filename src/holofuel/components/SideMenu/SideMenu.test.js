import React from 'react'
import { render } from '@testing-library/react'
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

  it('renders UI Version number', () => {
    const { getByText } = render(<SideMenu {...props} />)
    const versionText = `UI v${process.env.REACT_APP_VERSION}`
    expect(getByText(versionText)).toBeInTheDocument()
  })
})
