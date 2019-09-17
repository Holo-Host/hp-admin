import React from 'react'
import cx from 'classnames'
// not importing styles here breaks tests. This is a hack.
import styles from './Button.module.css' // eslint-disable-line no-unused-vars

function Button ({
  disabled = false,
  wide = false,
  variant = 'plain',
  className,
  onClick = () => {},
  children,
  type,
  dataTestId
}) {
  const classes = cx('button', {
    wide,
    primary: (variant === 'primary'),
    secondary: (variant === 'secondary'),
    plain: (variant === 'plain'),
    mini: (variant === 'mini'),
    link: (variant === 'link'),
    danger: (variant === 'danger'),
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

export default Button
