import React, { useState, useEffect } from 'react'
import cx from 'classnames'
import Button from 'components/Button'
import HashAvatar from 'components/HashAvatar'
import './Header.module.css'
import { withRouter } from 'react-router'
import { holochainClient as webSdkConnection, hostContext } from 'holochainClient'

import MenuIcon from 'components/icons/MenuIcon'
import CopyAgentId from 'holofuel/components/CopyAgentId'

export function Header ({ agent, agentLoading, history: { push }, hamburgerClick = () => push('/dashboard'), inboxCount, isWide }) {
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [shouldDisable, setShouldDisable] = useState()

  useEffect(() => {
    if (!(process.env.REACT_APP_RAW_HOLOCHAIN === 'true') && process.env.REACT_APP_HOLOFUEL_APP === 'true') {
      // once chaperone is updated, disable if the context is less than 3
      setShouldDisable(!hostContext || hostContext < 2)
    }
  }, [])

  const handleAppAccess = async () => {
    if (isSignedIn) {
      await webSdkConnection.signOut()
      setIsSignedIn(false)
      // todo: the context is hard coded in chaperone right now to only return 2;
      // once chaperone is updated, update this sign in to only occur if the context is 3
    } else if (!isSignedIn && hostContext >= 2) {
      await webSdkConnection.signIn()
      setIsSignedIn(true)
    }
  }

  const leftNav = <Button onClick={hamburgerClick} styleName='menu-button' dataTestId='menu-button'>
    <MenuIcon styleName='menu-icon' color='#000000' />
    {inboxCount > 0 && <span styleName='nav-badge' data-testid='inboxCount-badge'>{inboxCount}</span>}
  </Button>

  if (agentLoading) agentLoading = <h4>Loading...</h4>

  return <header>
    <section styleName='header'>
      <div styleName='left-nav'>
        {leftNav}
      </div>
      <div styleName='center-nav'>
        <div styleName={cx('page-header', { desktop: isWide })}>
          <h1 styleName='page-title'>Test Fuel</h1>
        </div>
      </div>
      <div>
        <CopyAgentId agent={agent} isMe>
          <HashAvatar seed={agent.id} size={32} dataTestId='hash-icon' />
        </CopyAgentId>
        <button styleName='signout-button' disabled={shouldDisable} onClick={() => handleAppAccess()}>Sign Out</button>
      </div>
    </section>
  </header>
}

export default withRouter(Header)
