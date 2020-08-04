import React, { useState, useEffect } from 'react'
import cx from 'classnames'
import HashAvatar from 'components/HashAvatar'
import './Header.module.css'
import { withRouter } from 'react-router'
import { holochainClient as webSdkConnection, HOSTED_HOLOFUEL_CONTEXT } from 'holochainClient'
import MenuButton from 'holofuel/components/MenuButton'
import CopyAgentId from 'holofuel/components/CopyAgentId'

export function Header ({ agent, history: { push }, hamburgerClick = () => push('/dashboard'), newActionableItems, hostedAgentContext, isSignedInAsHostedAgent, setIsSignedInAsHostedAgent }) {
  const [shouldDisable, setShouldDisable] = useState()
  console.log('SIGNED IN?? : ', isSignedInAsHostedAgent);
  console.log('HOST CONTEXT ?? : ', hostedAgentContext);
  
  useEffect(() => {
    if (HOSTED_HOLOFUEL_CONTEXT) {
      // once chaperone is updated, disable if the context is less than 3
      setShouldDisable(!hostedAgentContext || hostedAgentContext < 2)
    }
  }, [hostedAgentContext, setShouldDisable])

  const handleAppAccess = async () => {
    console.log('LOGGING IN/OUT: ');
    console.log('SIGNED IN?? : ', isSignedInAsHostedAgent);
    if (isSignedInAsHostedAgent) {
      await webSdkConnection.signOut()
      setIsSignedInAsHostedAgent(false)
      // todo: the context is hard coded in chaperone right now to only return 2;
      // once chaperone is updated, update this sign in to only occur if the context is 3
    } else if (!isSignedInAsHostedAgent && hostedAgentContext >= 2) {
      await webSdkConnection.signIn()
      setIsSignedInAsHostedAgent(true)
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
