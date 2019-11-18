import React from 'react'
import cx from 'classnames'
import './NullStateMessage.module.css'

function NullStateMessage ({
  wide = false,
  className,
  message,
  children,
  dataTestId
}) {
  const classes = cx('null-state-body', { wide })

  return (
    <div
      className={className}
      styleName={classes}
      data-testid={dataTestId}
    >
      <h3 styleName='null-state-message'>{message}</h3>

      {children}

    </div>
  )
}

export default NullStateMessage
