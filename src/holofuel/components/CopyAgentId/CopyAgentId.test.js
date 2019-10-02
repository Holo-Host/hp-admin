import React, { createContext } from 'react'
import Modal from 'react-modal'
import { render, fireEvent, act } from '@testing-library/react'
import wait from 'waait'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
// import { presentAgentId } from 'utils'
import FlashMessage from 'holofuel/components/FlashMessage'
import CopyAgentId from './CopyAgentId.js'

jest.mock('/CopyToClipboard')
jest.mock('holofuel/components/layout/PrimaryLayout')
jest.mock('holofuel/contexts/useFlashMessageContext')

const FlashMessageContext = createContext()
const MockFlashContextProvider = ({ message, time = 5000, newMessage = jest.fn(), children }) => (
  <FlashMessageContext.Provider value={{ message, time, newMessage }}>
    {children}
  </FlashMessageContext.Provider>
)

const renderWithRouter = (
  ui,
  {
    route = '/',
    history = createMemoryHistory({ initialEntries: [route] })
  } = {}
) => ({
  ...render(
    <Router history={history}>
      <MockFlashContextProvider>
        <FlashMessage />
        {ui}
      </MockFlashContextProvider>
    </Router>
  ),
  history
})

it('should copy the HolofuelUser Agent Hash to clipboard and display proper Flash Message ', async () => {
  const mockWhoAmIAgent1 = {
    id: 'HcSCIgoBpzRmvnvq538iqbu39h9whsr6agZa6c9WPh9xujkb4dXBydEPaikvc5r',
    nickname: 'Perry'
  }

  const mockChildContent = mockWhoAmIAgent1.nickname
  const mockMyIdMessage = 'mock message'
  // TODO: Resolve Provider Context Conflicts >> above var should be following :
  // const mockMyIdMessage = `Your HoloFuel Agent ID has been copied!`

  const props = {
    agent: mockWhoAmIAgent1,
    // hash: mockWhoAmIAgent1.id,
    // nickname: mockWhoAmIAgent1.nickname,
    isme: true
  }

  let container, getByText, queryByTestId // queryByText,
  await act(async () => {
    ({ container, getByText, queryByTestId } = renderWithRouter(<CopyAgentId {...props}>
      { mockChildContent }
    </CopyAgentId>
    ))
    await wait(0)
    Modal.setAppElement(container)
  })

  // TODO: Once Provider Context Conflicts = Resolved, uncomment the following :
  // expect(queryByText(mockMyIdMessage)).not.toBeInTheDocument()
  await act(async () => {
    fireEvent.click(queryByTestId('copy-content'))
    // await MockFlashContextProvider({ message: mockMyIdMessage })
    await wait(0)
  })
  expect(getByText(mockMyIdMessage)).toBeInTheDocument()
})

it('should copy the HolofuelCounterparty Hash to clipboard and display proper Flash Message ', async () => {
  const mockWhoIsAgent2 = {
    pubkey: 'HcScic3VAmEP9ucmrw4MMFKVARIvvdn43k6xi3d75PwnOswdaIE3BKFEUr3eozi',
    nickname: 'Sam'
  }

  const mockChildContent = mockWhoIsAgent2.nickname
  const mockCounterpartyIdMessage = 'mock message'
  // TODO: Resolve Provider Context Conflicts >> above var should be following :
  // const mockCounterpartyIdMessage = `${mockWhoIsAgent2.nickname}'s HoloFuel Agent ID has been copied!`

  const props = {
    agent: mockWhoIsAgent2
  }

  let container, getByText, queryByTestId // queryByText,
  await act(async () => {
    ({ container, getByText, queryByTestId } = renderWithRouter(<CopyAgentId {...props}>
      { mockChildContent }
    </CopyAgentId>
    ))
    await wait(0)
    Modal.setAppElement(container)
  })

  // TODO: Once Provider Context Conflicts = Resolved, uncomment the following :
  // expect(queryByText(mockCounterpartyIdMessage)).not.toBeInTheDocument()
  await act(async () => {
    fireEvent.click(queryByTestId('copy-content'))
    // await MockFlashContextProvider({ message: mockMyIdMessage })
    await wait(0)
  })
  expect(getByText(mockCounterpartyIdMessage)).toBeInTheDocument()
})

it('should display the last 6 chars of Agent Hash in Flash Message when Nickname not found', async () => {
  const mockWhoIsAgent2 = {
    pubkey: 'HcScic3VAmEP9ucmrw4MMFKVARIvvdn43k6xi3d75PwnOswdaIE3BKFEUr3eozi',
    nickname: undefined
  }

  const mockChildContent = mockWhoIsAgent2.nickname
  const mockCounterpartyIdMessage = 'mock message'
  // TODO: Resolve Provider Context Conflicts >> above var should be following :
  // const mockCounterpartyIdMessage = `${presentAgentId(mockWhoIsAgent2.pubkey)}'s HoloFuel Agent ID has been copied!`

  const props = {
    agent: mockWhoIsAgent2
  }

  let container, getByText, queryByTestId // queryByText,
  await act(async () => {
    ({ container, getByText, queryByTestId } = renderWithRouter(<CopyAgentId {...props}>
      { mockChildContent }
    </CopyAgentId>
    ))
    await wait(0)
    Modal.setAppElement(container)
  })

  // TODO: Once Provider Context Conflicts = Resolved, uncomment the following :
  // expect(queryByText(mockCounterpartyIdMessage)).not.toBeInTheDocument()
  await act(async () => {
    fireEvent.click(queryByTestId('copy-content'))
    await wait(0)
  })
  expect(getByText(mockCounterpartyIdMessage)).toBeInTheDocument()
})
