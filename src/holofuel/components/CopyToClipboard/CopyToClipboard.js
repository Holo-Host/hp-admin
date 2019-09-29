import { string } from 'prop-types'
import React, { useState } from 'react'
import ReactTooltip from 'react-tooltip'
import copy from 'copy-to-clipboard'
import './CopyToClipboard.module.css'

export default function CopyToClipboard ({
  hash,
  nickname,
  toolTipId,
  children
}) {
  const [copied, setCopied] = useState(false)
  const copyHash = () => {
    console.log('COPYING HASH : ', hash)
    copy(hash)
    setCopied(true)
  }
  if (!nickname)nickname = 'User'

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
