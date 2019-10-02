import React, { createContext } from 'react'
import { render, fireEvent, act } from '@testing-library/react'
import wait from 'waait'
import { Router } from 'react-router-dom'
import { MockedProvider } from '@apollo/react-testing'
import FlashMessage from 'holofuel/components/FlashMessage'
import { createMemoryHistory } from 'history'
import { presentAgentId } from 'utils'

// testing the named export Header rather than the default export which is wrapped in withRouter
import { Header } from './Header'
import { title as menuIconTitle } from 'components/icons/MenuIcon'

jest.mock('holofuel/contexts/useFlashMessageContext')

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
    agent: { id: 'QmAGENTHASH', nickname: 'AGENT NICKNAME' }
  }
  const { getByText, getByTestId } = renderWithRouter(<Header {...props} />)

  expect(getByText(props.title)).toBeInTheDocument()
  expect(getByText(menuIconTitle)).toBeInTheDocument()
  expect(getByText(props.agent.nickname) || getByText(presentAgentId(props.agent.id))).toBeInTheDocument()

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

it('should render lst 6 of agent id when agent is loading', () => {
  const props = {
    title: 'the title',
    history: { push: jest.fn() },
    agent: { id: 'QmAGENTHASH', nickname: undefined },
    agentLoading: true
  }
  const { getByText } = renderWithRouter(<Header {...props} />)
  expect(getByText(presentAgentId(props.agent.id))).toBeInTheDocument()
})

// TODO: Resolve Provider Context Conflicts >
it.skip('should copy the agentId when clicked and trigger the proper flash message', async () => {
  const FlashMessageContext = createContext()
  const MockFlashContextProvider = ({ message, time = 5000, newMessage = jest.fn(), children }) => (
    <FlashMessageContext.Provider value={{ message, time, newMessage }}>
      {children}
    </FlashMessageContext.Provider>
  )

  const mockMyIdMessage = `Your HoloFuel Agent ID has been copied!`
  const props = {
    title: 'the title',
    history: { push: jest.fn() },
    agent: { id: 'QmAGENTHASH', nickname: 'AGENT NICKNAME' }
  }

  let getByText, queryByText, queryAllByTestId
  await act(async () => {
    ({ getByText, queryByText, queryAllByTestId } = render(<MockedProvider mocks={[]} addTypename={false}>
      <MockFlashContextProvider>
        <FlashMessage />
        <Header {...props} />
      </MockFlashContextProvider>
    </MockedProvider>))
    await wait(0)
  })

  expect(getByText(props.agent.nickname)).toBeInTheDocument()
  expect(queryByText(mockMyIdMessage)).not.toBeInTheDocument()

  await act(async () => {
    const hashDisplay = queryAllByTestId('copy-content')
    fireEvent.click(hashDisplay[0])
    await MockFlashContextProvider({ message: mockMyIdMessage })
    await wait(0)
  })

  expect(getByText(mockMyIdMessage)).toBeInTheDocument()
})
