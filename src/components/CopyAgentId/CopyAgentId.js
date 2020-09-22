import { bool, object } from 'prop-types'
import React from 'react'
import CopyToClipboard from 'components/CopyToClipboard'
import { presentAgentId } from 'utils'

export default function CopyAgentId ({
  agent,
  isMe,
  className,
  children
}) {
  let messageText

  const { id: hash, nickname } = agent

  if (isMe) {
    messageText = `Your HP Admin Agent ID has been copied!`
  } else if (nickname) {
    messageText = `${nickname}'s HP Admin Agent ID has been copied!`
  } else {
    messageText = `Full HP Admin Agent ID of ${presentAgentId(hash)} has been copied!`
  }

  return <CopyToClipboard copyContent={hash} messageText={messageText} className={className}>
    {children}
  </CopyToClipboard>
}

CopyAgentId.propTypes = {
  agent: object,
  isMe: bool
}
