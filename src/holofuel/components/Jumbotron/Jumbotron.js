import React from 'react'
import cx from 'classnames'
import './Jumbotron.module.css'

export default function Jumbotron ({
  wide = false,
  className,
  titleSuperscript,
  title,
  children,
  dataTestId
}) {
  const classes = cx('jumbotron-body', { wide })

  return (
    <div
      className={className}
      styleName={classes}
      data-testid={dataTestId}
    >
      <h6 styleName='jumbotron-superscript'>{titleSuperscript}</h6>
      <h1 styleName='jumbotron-title'>{title}</h1>
      {children}
    </div>
  )
}
