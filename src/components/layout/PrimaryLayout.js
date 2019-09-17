import React, { useContext } from 'react'
import { object } from 'prop-types'
import cx from 'classnames'
import ScreenWidthContext from 'contexts/screenWidth'
import styles from './PrimaryLayout.module.css' // eslint-disable-line no-unused-vars
import 'global-styles/colors.css'
import 'global-styles/index.css'

import Header from 'components/Header'

export function PrimaryLayout ({
  children,
  headerProps = {}
}) {
  const isWide = useContext(ScreenWidthContext)

  return <div styleName={cx('styles.primary-layout', { 'styles.wide': isWide }, { 'styles.narrow': !isWide })}>
    <Header {...headerProps} />
    {children}
  </div>
}

PrimaryLayout.propTypes = {
  headerProps: object
}

export default PrimaryLayout
