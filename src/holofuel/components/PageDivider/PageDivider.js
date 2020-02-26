import React from 'react'
import cx from 'classnames'
import Loading from 'components/Loading'
// not importing styles here breaks tests. This is a hack.
import styles from './PageDivider.module.css' // eslint-disable-line no-unused-vars

function PageDivider ({
  wide = false,
  className,
  title,
  dataTestId,
  loading
}) {
  const classes = cx('divider', { wide })

  return (
    <div
      className={className}
      styleName={classes}
      data-testid={dataTestId}
    >
      {title}
      {loading && <Loading styleName='loading' height={16} width={16} />}
    </div>
  )
}

export default PageDivider
