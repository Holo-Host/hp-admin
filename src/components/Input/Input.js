import React from 'react'
import cx from 'classnames'
import './Input.module.css'

export default React.forwardRef(({
  variant = 'base',
  type = 'text',
  disabled,
  className,
  ...props
}, ref) => {
  const classes = cx('input', {
    'input-box': (!['checkbox', 'radio', 'submit'].includes(type)),
    'input-big': (variant === 'big'),
    'input-number': (type === 'number'),
    disabled
  })

  return <input
    type={type}
    ref={ref}
    styleName={classes}
    className={className}
    disabled={disabled}
    {...props}
  />
})
