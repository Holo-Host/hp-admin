import React, { createContext } from 'react'
import Modal from 'react-modal'
import { render, fireEvent, act } from '@testing-library/react'
import wait from 'waait'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import FlashMessage from 'holofuel/components/FlashMessage'
import CopyToClipboard from './CopyToClipboard.js'

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

it('should copy the HolofuelUser Agent Hash to clipboard and display flash message feedback', async () => {
  const mockChildContent = 'MOCK STRING CHILD'
  const mockMessage = 'AGENT_HASH_123 mock message'

  const props = {
    copyContent: 'AGENT_HASH_123',
    messageText: mockMessage
  }

  let container, getByText, queryByTestId
  await act(async () => {
    ({ container, getByText, queryByTestId } = renderWithRouter(<CopyToClipboard {...props}>
      { mockChildContent }
    </CopyToClipboard>
    ))
    await wait(0)
    Modal.setAppElement(container)
  })

  await act(async () => {
    fireEvent.click(queryByTestId('copy-content'))
    await wait(0)
  })
  expect(getByText(mockMessage)).toBeInTheDocument()
})
