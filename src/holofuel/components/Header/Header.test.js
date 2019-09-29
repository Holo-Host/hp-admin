import React from 'react'
import { render, fireEvent } from '@testing-library/react'
// import wait from 'waait'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'

// testing the named export Header rather than the default export which is wrapped in withRouter
import { Header } from './Header'
import { title as menuIconTitle } from 'components/icons/MenuIcon'

function renderWithRouter (
  ui,
  {
    route = '/',
    history = createMemoryHistory({ initialEntries: [route] })
  } = {}
) {
  return {
    ...render(<Router history={history}>{ui}</Router>),
    history
  }
}

it('should render the title and a menu icon', () => {
  const props = {
    title: 'the title',
    history: { push: jest.fn() },
    agent: 'AGENT NICKNAME'
  }
  const { getByText, getByTestId } = renderWithRouter(<Header {...props} />)

  expect(getByText(props.title)).toBeInTheDocument()
  expect(getByText(menuIconTitle)).toBeInTheDocument()

  fireEvent.click(getByTestId('menu-button'))

  expect(props.history.push).toHaveBeenCalledWith('/dashboard')
})

it('should render the agent nickname', () => {
  const props = {
    title: 'the title',
    history: { push: jest.fn() },
    agent: { id: 'QmAGENTHASH', nickname: 'AGENT NICKNAME' }
  }
  const { getByText } = renderWithRouter(<Header {...props} />)

  expect(getByText(props.agent.nickname)).toBeInTheDocument()
})

it('should render loading indicator when agent is loading', () => {
  const props = {
    title: 'the title',
    history: { push: jest.fn() },
    agent: {},
    agentLoading: true
  }
  const { getByText } = renderWithRouter(<Header {...props} />)
  expect(getByText('Loading...')).toBeInTheDocument()
})
