import React, { useContext } from 'react'
import { object } from 'prop-types'
import cx from 'classnames'
import ScreenWidthContext from 'contexts/screenWidth'
import FlashMessage from 'components/FlashMessage'
import Header from 'components/Header'
import AlphaFlag from 'components/AlphaFlag'
import useConnectionContext from 'contexts/useConnectionContext'
import { isLoginPage } from 'utils/urls'
import { useSettingsData } from 'components/wrappers/ManageConnection'
import styles from './PrimaryLayout.module.css' // eslint-disable-line no-unused-vars
import 'global-styles/colors.css'
import 'global-styles/index.css'

export default function PrimaryLayout ({
  children,
  headerProps = {},
  showHeader = true
}) {
	const { connectionStatus } = useConnectionContext()
	const { settings } = useSettingsData()
	const isWide = useContext(ScreenWidthContext)

	return <div styleName='styles.primary-layout'>
    <div styleName={cx({ 'styles.wide': isWide }, { 'styles.narrow': !isWide })}>
      {showHeader && <Header
        {...headerProps}
        settings={connectionStatus.hpos ? settings : {}} />}

      <div styleName='styles.content'>
        <FlashMessage />
        {children}
      </div>
    </div>

    {isLoginPage(window) && <div styleName='styles.wrapper'>
      <div styleName='styles.container'>
        <footer styleName='styles.footer'>
          <div styleName='styles.alpha-info'>
            <AlphaFlag variant='right' styleName='styles.alpha-flag' />
            <p>
              HP Admin is in Alpha testing.
            </p>
            <p>
              Learn more about out our&nbsp;
              <a href='https://holo.host/holo-testnet' target='_blank' rel='noopener noreferrer' styleName='styles.alpha-link'>
                Alpha Testnet.
              </a>
            </p>
            <ul styleName='styles.footer-list'>
              <li styleName='styles.footer-list-item'>
                <a href='https://forum.holo.host' target='_blank' rel='noopener noreferrer' styleName='styles.footer-link'>Help</a>
              </li>
              <li styleName='styles.footer-list-item'>
                <a href='http://holo.host/alpha-terms' target='_blank' rel='noopener noreferrer' styleName='styles.footer-link'>View Terms of Service</a>
              </li>
            </ul>
          </div>
        </footer>
      </div>
    </div>}
  </div>
}

PrimaryLayout.propTypes = {
  headerProps: object
}
