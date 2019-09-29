import { string } from 'prop-types'
import React, { useState } from 'react'
import ReactTooltip from 'react-tooltip'
import copy from 'copy-to-clipboard'
import './CopyToClipboard.module.css'

export default function CopyToClipboard ({
  hash,
  nickname,
  children
}) {
  const [copied, setCopied] = useState(false)
  const copyHash = () => {
    copy(hash)
    setCopied(true)
  }

  return <div data-tip={hash} onClick={copyHash} data-testid='hash-icon' styleName='copy-item'>
    {children}
    <ReactTooltip
      delayShow={250}
      afterHide={() => setCopied(false)}
      getContent={dataTip => dataTip === hash && nickname
        ? `${nickname}'s ID: ${hash} - ${copied ? 'Copied to clipboard' : 'Click to copy'}`
        : dataTip === hash
          ? `Agent ID: ${hash} - ${copied ? 'Copied to clipboard' : 'Click to copy'}`
          : null
      } />
  </div>
}

CopyToClipboard.propTypes = {
  hash: string,
  nickname: string
}
