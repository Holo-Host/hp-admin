import { string } from 'prop-types'
import React from 'react'
import copy from 'copy-to-clipboard'
import './CopyToClipboard.module.css'
import useFlashMessageContext from 'holofuel/contexts/useFlashMessageContext'

export default function CopyToClipboard ({
  copyContent,
  messageText,
  children
}) {
  if (!messageText) messageText = `${copyContent} has been copied!`

  const { newMessage } = useFlashMessageContext()
  const handleCopyItem = async () => {
    const wasCopied = await copy(copyContent)
    if (wasCopied === true) newMessage(messageText, 5000)
  }

  return <div onClick={handleCopyItem} data-testid='copy-content' styleName='copy-item'>
    {children}
  </div>
}

CopyToClipboard.propTypes = {
  copyContent: string,
  messageText: string
}
