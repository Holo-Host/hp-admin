import React from 'react'
import { fireEvent, act } from '@testing-library/react'
import wait from 'waait'
import CopyToClipboard from './CopyToClipboard.js'
import { newMessage as mockNewMessage } from 'holofuel/contexts/useFlashMessageContext'
import mockCopy from 'copy-to-clipboard'
import { renderAndWait } from 'utils/test-utils'

jest.mock('holofuel/components/layout/PrimaryLayout')
jest.mock('holofuel/contexts/useFlashMessageContext')
jest.mock('copy-to-clipboard')

it('should copy the copyContent to clipboard and display flash message feedback', async () => {
  const childContent = 'Mock String Child'
  const messageText = 'New message.'
  const copyContent = 'AGENT_HASH_123'

  const props = {
    copyContent,
    messageText
  }

  const { getByText } = await renderAndWait(<CopyToClipboard {...props}>
    { childContent }
  </CopyToClipboard>)

  await act(async () => {
    fireEvent.click(getByText(childContent))
    await wait(100)
  })
  expect(mockCopy).toHaveBeenCalledWith(copyContent)
  expect(mockNewMessage).toHaveBeenCalledWith(messageText, 5000)
})
