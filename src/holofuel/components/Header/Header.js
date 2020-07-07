import React from 'react'
import Button from 'components/Button'
import HashAvatar from 'components/HashAvatar'
import './Header.module.css'
import { withRouter } from 'react-router'
import MenuIcon from 'components/icons/MenuIcon'
import CopyAgentId from 'holofuel/components/CopyAgentId'

export function Header ({ title, agent, agentLoading, history: { push }, hamburgerClick = () => push('/dashboard'), inboxCount }) {
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
        <div styleName='page-header'>
          <h1 styleName='page-title'>Test Fuel</h1>
        </div>
      </div>
      <div>
        <CopyAgentId agent={agent} isMe>
          <HashAvatar seed={agent.id} size={32} dataTestId='hash-icon' />
        </CopyAgentId>
      </div>
    </section>
  </header>
}

export default withRouter(Header)
