import React from 'react'
import cx from 'classnames'
// not importing styles here breaks tests. This is a hack.
import styles from './NullStateMessage.module.css' // eslint-disable-line no-unused-vars

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
      {message}
      {children}
    </div>
  )
}

export default NullStateMessage
