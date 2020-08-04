import React from 'react'
import { render, fireEvent, act } from '@testing-library/react'
import wait from 'waait'
import { PROFILE_PATH } from 'holofuel/utils/urls'
import { history } from 'react-router-dom'

// testing the named export Header rather than the default export which is wrapped in withRouter
import { Header } from './Header'
import { title as menuIconTitle } from 'components/icons/MenuIcon'

jest.mock('holofuel/contexts/useFlashMessageContext')
jest.mock('holofuel/components/layout/PrimaryLayout')
jest.mock('components/HashAvatar')

it('should render the title and a menu icon', () => {
  const props = {
    history: { push: jest.fn() },
    agent: { id: 'QmAGENTHASH', nickname: 'AGENT NICKNAME' }
  }
  const { getByText, getByTestId } = render(<Header {...props} />)

  expect(getByText('Test Fuel')).toBeInTheDocument()
  expect(getByText(menuIconTitle)).toBeInTheDocument()

  fireEvent.click(getByTestId('menu-button'))
  expect(props.history.push).toHaveBeenCalledWith('/dashboard')
})

it('should render the title and a menu icon with update badge when inbox updates exist', () => {
  const props = {
    history: { push: jest.fn() },
    agent: { id: 'QmAGENTHASH', nickname: 'AGENT NICKNAME' },
    newActionableItems: 2
  }
  const { getByText, getByTestId } = render(<Header {...props} />)

  expect(getByText(menuIconTitle)).toBeInTheDocument()
  expect(getByTestId('inboxCount-badge')).toBeInTheDocument()

  fireEvent.click(getByTestId('menu-button'))

  expect(props.history.push).toHaveBeenCalledWith('/dashboard')
})

it('should render the menu icon without update badge when no inbox updates exist', () => {
  const props = {
    history: { push: jest.fn() },
    agent: { id: 'QmAGENTHASH', nickname: 'AGENT NICKNAME' },
    newActionableItems: 0
  }
  const { getByText, getByTestId } = render(<Header {...props} />)

  expect(getByText(menuIconTitle)).toBeInTheDocument()
  expect(document.querySelector('[data-testid="inboxCount-badge"]')).not.toBeInTheDocument()

  fireEvent.click(getByTestId('menu-button'))

  expect(props.history.push).toHaveBeenCalledWith('/dashboard')
})

// TODO: Debug
it.skip('should redirect to the Profile Page when clicked', async () => {
  const nickname = 'My rad nickname'
  const props = {
    title: 'the title',
    history: {
      push: () => {}
    },
    agent: {
      id: 'QmAGENTHASH',
      nickname
    }
  }

  const { getByTestId } = render(<Header {...props} />)
  await act(async () => {
    fireEvent.click(getByTestId('hash-icon'))
    await wait(100)
  })
  expect(history.push).toHaveBeenCalledWith(PROFILE_PATH)
})
