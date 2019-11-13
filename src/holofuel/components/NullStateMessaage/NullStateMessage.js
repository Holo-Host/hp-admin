import React from 'react'
import cx from 'classnames'
// not importing styles here breaks tests. This is a hack.
import styles from './NullStateMessage.module.css' // eslint-disable-line no-unused-vars

function NullStateMessage ({
  wide = false,
  className,
  nessage,
  children,
  dataTestId
}) {
  const classes = cx('NullStateMessage-body', { wide })

  return (
    <div
      className={className}
      styleName={classes}
      data-testid={dataTestId}
    >
      <h3>{}</h3>
      {children}
    </div>
  )
}

export default NullStateMessage
