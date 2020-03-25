import { bool, object } from 'prop-types'
import React from 'react'
import CopyToClipboard from 'components/CopyToClipboard'
import { presentAgentId } from 'utils'

export default function CopyAgentId ({
  agent,
  isMe,
  hpAdmin,
  className,
  children
}) {
  const { id: hash, nickname } = agent
  const happName = hpAdmin ? 'HP Admin' : 'HoloFuel'

  let messageText

  if (isMe) {
    messageText = `Your ${happName} Agent ID has been copied!`
  } else if (nickname) {
    messageText = `${nickname}'s ${happName} Agent ID has been copied!`
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
