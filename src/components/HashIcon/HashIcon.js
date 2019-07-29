import { string } from 'prop-types'
import React from 'react'
import './HashIcon.module.css'

export default function HashIcon ({
  hash,
  size = 64,
  className
}) {
  const style = {
    width: size,
    height: size
  }
  return <div style={style} className={className}>
    {hash}
  </div>
}

HashIcon.propTypes = {
  hash: string,
  size: string,
  className: string
}
