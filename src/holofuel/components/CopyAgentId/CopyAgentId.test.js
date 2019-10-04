import React from 'react'
import { render } from '@testing-library/react'
import CopyAgentId from './CopyAgentId.js'
import { presentAgentId } from 'utils'
import CopyToClipboard from 'holofuel/components/CopyToClipboard'

jest.mock('holofuel/components/CopyToClipboard')
jest.mock('holofuel/components/layout/PrimaryLayout')
jest.mock('holofuel/contexts/useFlashMessageContext')

it('render CopyToClipboard with "Your" in message when isMe', () => {
  const agent = {
    id: 'HcSCIgoBpzRmvnvq538iqbu39h9whsr6agZa6c9WPh9xujkb4dXBydEPaikvc5r',
    nickname: 'Perry'
  }

  const children = agent.nickname
  const messageText = 'Your HoloFuel Agent ID has been copied!'

  const props = {
    agent,
    isMe: true
  }

  render(<CopyAgentId {...props}>
    { children }
  </CopyAgentId>)

  expect(CopyToClipboard).toHaveBeenCalledWith(
    expect.objectContaining({
      children,
      copyContent: agent.id,
      messageText
    }), {})
})

it('render CopyToClipboard with nickname in message when nickname is available', async () => {
  const agent = {
    id: 'HcSCIgoBpzRmvnvq538iqbu39h9whsr6agZa6c9WPh9xujkb4dXBydEPaikvc5r',
    nickname: 'Perry'
  }

  const children = agent.nickname
  const messageText = "Perry's HoloFuel Agent ID has been copied!"

  const props = {
    agent
  }

  render(<CopyAgentId {...props}>
    { children }
  </CopyAgentId>)

  expect(CopyToClipboard).toHaveBeenCalledWith(
    expect.objectContaining({
      children,
      copyContent: agent.id,
      messageText
    }), {})
})

it('render CopyToClipboard with last 6 of id in message when nickname is NOT available', async () => {
  const agent = {
    id: 'HcSCIgoBpzRmvnvq538iqbu39h9whsr6agZa6c9WPh9xujkb4dXBydEPaikvc5r'
  }

  const children = agent.id
  const messageText = `Full Agent ID of ${presentAgentId(agent.id)} has been copied!`

  const props = {
    agent
  }

  render(<CopyAgentId {...props}>
    { children }
  </CopyAgentId>)

  expect(CopyToClipboard).toHaveBeenCalledWith(
    expect.objectContaining({
      children,
      copyContent: agent.id,
      messageText
    }), {})
})
