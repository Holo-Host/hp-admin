import React, { useState, useEffect } from 'react'
import { withRouter } from 'react-router'
import cx from 'classnames'
import useHostedAgentAuthStatusContext from 'holofuel/contexts/useHostedAgentAuthStatusContext'
import { holochainClient as webSdkConnection, HOSTED_HOLOFUEL_CONTEXT } from 'holochainClient'
import MenuButton from 'holofuel/components/MenuButton'
import CopyAgentId from 'holofuel/components/CopyAgentId'
import HashAvatar from 'components/HashAvatar'
import './Header.module.css'

export function Header ({ agent, history: { push }, hamburgerClick = () => push('/dashboard'), newActionableItems, hostedAgentContext }) {
  const { isSignedInAsHostedAgent, setIsSignedInAsHostedAgent } = useHostedAgentAuthStatusContext()
  const [shouldDisable, setShouldDisable] = useState()

  useEffect(() => {
    if (HOSTED_HOLOFUEL_CONTEXT) {
      // once chaperone is updated, disable if the context is less than 3
      setShouldDisable(!hostedAgentContext || hostedAgentContext < 2)
    }
  }, [hostedAgentContext, setShouldDisable])

  const handleAppAccess = async () => {
    if (isSignedInAsHostedAgent) {
      await webSdkConnection.signOut()
      setIsSignedInAsHostedAgent(false)
    }
  }

  return <header>
    <section styleName='header'>
      <div styleName='left-nav'>
        <MenuButton onClick={hamburgerClick} newActionableItems={newActionableItems} />
      </div>
      <div styleName='center-nav'>
        <div styleName={cx('page-header')}>
          <h1 styleName='page-title'>Test Fuel</h1>
        </div>
      </div>
      <div>
        <CopyAgentId agent={agent} isMe>
          <HashAvatar seed={agent.id} size={32} dataTestId='hash-icon' />
        </CopyAgentId>
        {HOSTED_HOLOFUEL_CONTEXT && <button styleName='signout-button' disabled={shouldDisable} onClick={() => handleAppAccess()}>{isSignedInAsHostedAgent ? 'Sign Out' : ''}</button>}
      </div>
    </section>
  </header>
}

export default withRouter(Header)
