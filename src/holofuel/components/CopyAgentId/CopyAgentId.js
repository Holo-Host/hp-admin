import { bool, object } from 'prop-types'
import React from 'react'
import CopyToClipboard from 'holofuel/components/CopyToClipboard'
import { presentAgentId } from 'utils'

export default function CopyAgentId ({
  agent,
  isMe,
  children
}) {
  const { id: hash } = agent
  let { nickname } = agent

  if (!nickname)nickname = `${presentAgentId(hash)}'s`
  if (isMe)nickname = 'Your'
  else nickname = `${nickname}'s`

  const messageText = `${nickname} HoloFuel Agent ID has been copied!`

  return <CopyToClipboard copyContent={hash} messageText={messageText}>
    {children}
  </CopyToClipboard>
}

CopyAgentId.propTypes = {
  agent: object,
  isMe: bool
}
