import React from 'react'
import cx from 'classnames'
// not importing styles here breaks tests. This is a hack.
import styles from './PageDivider.module.css' // eslint-disable-line no-unused-vars

function PageDivider ({
  wide = false,
  className,
  title,
  dataTestId
}) {
  const classes = cx('divider', { wide })

  return (
    <div
      className={className}
      styleName={classes}
      data-testid={dataTestId}
    >
      {title}
    </div>
  )
}

export default PageDivider
