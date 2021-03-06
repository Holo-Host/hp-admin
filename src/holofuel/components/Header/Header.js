import React from 'react'
import cx from 'classnames'
import HashAvatar from 'components/HashAvatar'
import './Header.module.css'
import { withRouter } from 'react-router'
import CopyAgentId from 'holofuel/components/CopyAgentId'
import MenuButton from '../MenuButton/MenuButton'

export function Header ({ agent, history: { push }, hamburgerClick = () => push('/dashboard'), newActionableItems }) {
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
      </div>
    </section>
  </header>
}

export default withRouter(Header)
