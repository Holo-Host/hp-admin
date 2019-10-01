import { string } from 'prop-types'
import React from 'react'
import copy from 'copy-to-clipboard'
import './CopyToClipboard.module.css'
import useFlashMessageContext from 'holofuel/contexts/useFlashMessageContext'
import { presentAgentId } from 'utils'

export default function CopyToClipboard ({
  hash,
  nickname,
  isMe,
  children
}) {
  if (!nickname)nickname = `${presentAgentId(hash)}'s`
  if (isMe)nickname = 'Your'
  else nickname = `${nickname}'s`
  const { newMessage } = useFlashMessageContext()

  const copyHash = async () => {
    const wasCopied = await copy(hash, { debug: true })
    if (wasCopied === true) newMessage(`${nickname} HoloFuel Agent ID has been copied!`, 5000)
  }

  return <div onClick={copyHash} data-testid='hash-display' styleName='copy-item'>
    {children}
  </div>
}

CopyToClipboard.propTypes = {
  hash: string,
  nickname: string
}
