import { string, number } from 'prop-types'
import React, { useState } from 'react'
import ReactTooltip from 'react-tooltip'
import copy from 'copy-to-clipboard'
import { Network as Identicon } from 'react-identicon-variety-pack'
import './HashIcon.module.css'

export default function HashIcon ({
  hash,
  size = 64,
  className
}) {
  const [copied, setCopied] = useState(false)
  const copyHash = () => {
    copy(hash)
    setCopied(true)
  }

  return <div data-tip={hash} onClick={copyHash} data-testid='hash-icon'>
    <Identicon
      seed={hash}
      size={size}
      className={className}
      circle />
    <ReactTooltip
      delayShow={250}
      afterHide={() => setCopied(false)}
      getContent={dataTip => dataTip === hash ? `${hash} - ${copied ? 'Copied to clipboard' : 'Click to copy'}` : null} />
  </div>
}

HashIcon.propTypes = {
  hash: string,
  size: number,
  className: string
}
