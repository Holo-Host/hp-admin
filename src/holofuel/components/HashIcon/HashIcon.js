import { string, number } from 'prop-types'
import React from 'react'
import { Network as Identicon } from 'react-identicon-variety-pack'
import './HashIcon.module.css'

export default function HashIcon ({
  hash,
  size = 64,
  className
}) {
  return <Identicon
    seed={hash}
    size={size}
    className={className}
    circle />
}

HashIcon.propTypes = {
  hash: string,
  size: number,
  className: string
}
