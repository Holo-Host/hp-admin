import React from 'react'
import cx from 'classnames'
// not importing styles here breaks tests. This is a hack.
import styles from './UIButton.module.css' // eslint-disable-line no-unused-vars

function UIButton ({
  disabled = false,
  variant = 'green',
  type,
  className,
  onClick = () => {},
  children,
  dataTestId
}) {
  const classes = cx('button', {
    white: variant === 'white',
    green: variant === 'green',
    'red-on-white': variant === 'red-on-white',
    disabled
  })

  return (
    <button
      onClick={disabled ? () => {} : onClick}
      className={className}
      styleName={classes}
      disabled={disabled}
      type={type}
      data-testid={dataTestId}
    >
      {children}
    </button>
  )
}

export default UIButton
