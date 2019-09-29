import { string } from 'prop-types'
import React, { useState } from 'react'
import ReactTooltip from 'react-tooltip'
import copy from 'copy-to-clipboard'
import './CopyToClipboard.module.css'
import useFlashMessageContext from 'holofuel/contexts/useFlashMessageContext'
import { presentAgentId } from 'utils'

export default function CopyToClipboard ({
  hash,
  nickname,
  isMe,
  toolTipId,
  children
}) {
  if (!nickname)nickname = `${presentAgentId(hash)}'s`
  if (isMe)nickname = 'Your'
  else nickname = `${nickname}'s`
  const { newMessage } = useFlashMessageContext()

  const [copied, setCopied] = useState(false)
  const copyHash = () => {
    console.log('COPYING HASH : ', hash)
    copy(hash)
    setCopied(true)
    newMessage(`${nickname} HoloFuel Agent ID has been copied!`, 5000)
  }

  return <div styleName='copy-item'>
    <div data-for={toolTipId} data-tip='' onClick={copyHash} data-testid='hash-display'>
      {children}
    </div>
    <ReactTooltip
      id={toolTipId}
      delayShow={250}
      afterHide={() => setCopied(false)}
      getContent={() => hash
        ? `${nickname} ID: ${hash} - ${copied ? 'Copied to clipboard' : 'Click to copy'}`
        : null
      }
    />
  </div>
}

CopyToClipboard.propTypes = {
  hash: string,
  nickname: string
}
