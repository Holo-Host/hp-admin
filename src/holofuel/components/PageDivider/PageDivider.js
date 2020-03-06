import React from 'react'
import cx from 'classnames'
import './PageDivider.module.css'

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
