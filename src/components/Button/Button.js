import React from 'react'
import cx from 'classnames'
import './Button.module.css'

function Button ({
  disabled = false,
  wide = false,
  variant = 'plain',
  className,
  onClick = () => {},
  children,
  dataTestId
}) {
  const classes = cx('button', {
    wide,
    primary: (variant === 'primary'),
    secondary: (variant === 'secondary'),
    plain: (variant === 'plain'),
    mini: (variant === 'mini')
  })

  return (
    <button
      onClick={disabled ? () => {} : onClick}
      className={className}
      styleName={classes}
      disabled={disabled}
      data-testid={dataTestId}
    >
      {children}
    </button>
  )
}

export default Button
