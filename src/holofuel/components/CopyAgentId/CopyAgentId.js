import { string, bool } from 'prop-types'
import React from 'react'
import CopyToClipboard from 'holofuel/components/CopyToClipboard'
import { presentAgentId } from 'utils'

export default function CopyAgentId ({
  agent,
  isMe,
  children
}) {
  // const { id: hash } = agent
  let hash
  if (agent.pubkey) { const { pubkey } = agent; hash = pubkey }
  if (agent.id) { const { id } = agent; hash = id }
  let { nickname } = agent

  if (!nickname)nickname = `${presentAgentId(hash)}'s`
  if (isMe)nickname = 'Your'
  else nickname = `${nickname}'s`

  const messageText = `${nickname} HoloFuel Agent ID has been copied!`

  return <React.Fragment>
    <CopyToClipboard copyContent={hash} messageText={messageText}>
      {children}
    </CopyToClipboard>
  </React.Fragment>
}

CopyAgentId.propTypes = {
  agent: string,
  isMe: bool
}
