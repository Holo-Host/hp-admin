import { bool, object } from 'prop-types'
import React from 'react'
import CopyToClipboard from 'holofuel/components/CopyToClipboard'
import { presentAgentId } from 'utils'

export default function CopyAgentId ({
  agent,
  isMe,
  className,
  children
}) {
  const { id: hash, nickname } = agent

  let messageText

  if (isMe) {
    messageText = 'Your HoloFuel Agent ID has been copied!'
  } else if (nickname) {
    messageText = `${nickname}'s HoloFuel Agent ID has been copied!`
  } else {
    messageText = `Full Agent ID of ${presentAgentId(hash)} has been copied!`
  }

  return <CopyToClipboard copyContent={hash} messageText={messageText} className={className}>
    {children}
  </CopyToClipboard>
}

CopyAgentId.propTypes = {
  agent: object,
  isMe: bool
}
