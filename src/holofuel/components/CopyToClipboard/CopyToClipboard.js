import { string } from 'prop-types'
import React, { useState } from 'react'
import ReactTooltip from 'react-tooltip'
import copy from 'copy-to-clipboard'
import './CopyToClipboard.module.css'
import useFlashMessageContext from 'holofuel/contexts/useFlashMessageContext'

export default function CopyToClipboard ({
  hash,
  nickname,
  isMe,
  toolTipId,
  children
}) {
  if (!nickname)nickname = 'User'
  if (isMe)nickname = 'Your'
  const { newMessage } = useFlashMessageContext()

  const [copied, setCopied] = useState(false)
  const copyHash = () => {
    console.log('COPYING HASH : ', hash)
    copy(hash)
    setCopied(true)
    newMessage(`${nickname}'s HoloFuel Agent ID has been copied!`, 5000)
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
        ? `${nickname}'s ID: ${hash} - ${copied ? 'Copied to clipboard' : 'Click to copy'}`
        : null
      }
    />
  </div>
}

CopyToClipboard.propTypes = {
  hash: string,
  nickname: string
}
