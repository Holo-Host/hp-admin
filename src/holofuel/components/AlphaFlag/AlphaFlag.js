import React from 'react'
import './AlphaFlag.module.css'
import cx from 'classnames'

export default function AlphaFlag ({ variant = 'left', className }) {
  const left = variant === 'left'
  const right = variant === 'right'
  const flagStyleNames = cx('flag', {
    left,
    right
  })
  return <div styleName='wrapper' className={className}>
    {left && <div styleName='left-arrow' />}
    <div styleName={flagStyleNames}>Alpha</div>
    {right && <div styleName='right-arrow' />}
  </div>
}
