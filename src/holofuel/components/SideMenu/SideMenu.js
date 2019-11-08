import React, { useState } from 'react'
import ReactTooltip from 'react-tooltip'
import cx from 'classnames'
import Modal from 'components/Modal'
import Button from 'components/Button'
import { Link } from 'react-router-dom'
import HashAvatar from 'components/HashAvatar'
import { presentHolofuelAmount } from 'utils' // presentAgentId
import CopyAgentId from 'holofuel/components/CopyAgentId'

import './SideMenu.module.css'

export function SideMenu ({
  isOpen,
  handleClose,
  avatarUrl = '',
  agent,
  agentLoading,
  inboxCount,
  holofuelBalance,
  isWide
}) {
  if (agentLoading) agentLoading = <h4>Loading...</h4>

  const [toggleModal, setToggleModal] = useState()
  const showModal = () => setToggleModal(true)

  return <aside styleName={cx('drawer', { 'drawer--open': isOpen })}>
    <div styleName='container'>
      <header styleName='header'>
        <h1 styleName='appName' data-testid='sidemenu-header'>HoloFuel</h1>
        <CopyAgentId agent={agent} isMe>
          <HashAvatar avatarUrl={avatarUrl} seed={agent.id} size={100} styleName='avatar' />
        </CopyAgentId>

        <span styleName='header-account'>
          <CopyAgentId agent={agent} isMe>
            {agent.nickname || agentLoading}
          </CopyAgentId>
        </span>
        <strong styleName='header-balance'>{presentHolofuelAmount(holofuelBalance)}</strong>
      </header>

      <nav styleName='nav'>
        <ul styleName='nav-list'>
          <li>
            <Link to='/inbox' styleName='nav-link' data-testid='inbox-link'>
              <div styleName='nav-icon' />
              Inbox
              {inboxCount > 0 && <span styleName='nav-badge'>{inboxCount}</span>}
            </Link>
          </li>
          <li>
            <Link to='/offer' styleName='nav-link'>
              <div styleName='nav-icon' />
              Offer
            </Link>
          </li>
          <li>
            <Link to='/request' styleName='nav-link'>
              <div styleName='nav-icon' />
              Request
            </Link>
          </li>
          <li>
            <Link to='/history' styleName='nav-link' data-testid='history-link'>
              <div styleName='nav-icon' />
              History
            </Link>
          </li>
          <li>
            {isWide
              ? <Link to='#/' data-tip='' data-for='hf-redemption' styleName='nav-link disabled-link'>
                <div styleName='nav-icon disabled' />
                Redeem
                <ReactTooltip
                  id='hf-redemption'
                  delayShow={250}
                  getContent={() => <>'Feature is to come... '</>}
                />
              </Link>
              : <>
                <Link to='#/' styleName='nav-link disabled-link' onClick={() => showModal()}>
                  <div styleName='nav-icon disabled' />
                  Redeem
                </Link>
              </>
            }
          </li>
        </ul>
      </nav>

      <footer styleName='footer'>
        <ul styleName='footer-list'>
          <li>
            <Link to='/tos' styleName='footer-link'>View Disclaimer</Link>
          </li>
          <li>
            <Link to='/tos' styleName='footer-link'>View Terms of Service</Link>
          </li>
        </ul>
      </footer>
    </div>

    <div styleName='drawer-overlay' onClick={handleClose} />

    <HfRedemptionDescriptionModal
      handleClose={() => setToggleModal(null)}
      toggleModal={toggleModal} />
  </aside>
}

function HfRedemptionDescriptionModal ({ toggleModal, handleClose }) {
  return <Modal
    contentLabel='HoloFuel Redemption'
    isOpen={!!toggleModal}
    handleClose={handleClose}
    styleName='modal topmost'>
    <div styleName='modal-title'>How to Redeem HoloFuel</div>
    <div styleName='modal-text' role='heading'>
      Feature is to come...
    </div>
    <div styleName='modal-buttons'>
      <Button
        onClick={handleClose}
        styleName='modal-button-no'>
        Ok
      </Button>
    </div>
  </Modal>
}

export default SideMenu
