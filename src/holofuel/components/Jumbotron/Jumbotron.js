import React from 'react'
import cx from 'classnames'
// not importing styles here breaks tests. This is a hack.
import styles from './Jumbotron.module.css' // eslint-disable-line no-unused-vars

function Jumbotron ({
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

export default Jumbotron
