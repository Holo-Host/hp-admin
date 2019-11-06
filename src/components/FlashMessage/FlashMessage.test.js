import React from 'react'
import { render, fireEvent, act } from '@testing-library/react'
import wait from 'waait'
import FlashMessage from './FlashMessage.js'
import useFlashMessageContext, { FlashMessageProvider } from 'holofuel/contexts/useFlashMessageContext'

// Think about ways to refactor this to test fewer implementation details.

function MockFlashMessageConsumer ({ message, time }) {
  const { newMessage } = useFlashMessageContext()
  return <button onClick={() => newMessage(message, time)}>
    New Message
  </button>
}

it('should render a closable message', () => {
  const message = 'this is the message'
  const { queryByText, getByText } = render(
    <FlashMessageProvider>
      <FlashMessage />
      <MockFlashMessageConsumer message={message} />
    </FlashMessageProvider>
  )

  expect(queryByText(message)).not.toBeInTheDocument()

  fireEvent.click(getByText('New Message'))

  expect(queryByText(message)).toBeInTheDocument()

  fireEvent.click(getByText('x'))

  expect(queryByText(message)).not.toBeInTheDocument()
})

it('should render a message which closes itself after the given time', async () => {
  const message = 'this is the message'
  const time = 10
  const { queryByText, getByText } = render(
    <FlashMessageProvider>
      <FlashMessage />
      <MockFlashMessageConsumer message={message} time={time} />
    </FlashMessageProvider>
  )

  expect(queryByText(message)).not.toBeInTheDocument()

  fireEvent.click(getByText('New Message'))

  expect(queryByText(message)).toBeInTheDocument()

  await act(async => wait(time * 2))

  expect(queryByText(message)).not.toBeInTheDocument()
})
