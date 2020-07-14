import { string, number } from 'prop-types'
import React from 'react'
import cx from 'classnames'
import { Network as Identicon } from 'react-identicon-variety-pack'
import './HashIcon.module.css'

function DefaultIdenticon ({
  size,
  className
}) {
  return <div styleName='default-identicon' style={{ width: size, height: size }} className={className} />
}

export default function HashIcon ({
  hash,
  size = 64,
  className
}) {
  return <div data-testid='hash-icon'>
    {hash ? <Identicon
      seed={hash}
      size={size}
      className={className}
      circle />
      : <DefaultIdenticon
        size={size}
        className={className} />}
  </div>
}

HashIcon.propTypes = {
  hash: string,
  size: number,
  className: string
}
