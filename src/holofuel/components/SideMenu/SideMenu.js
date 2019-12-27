import React, { useState } from 'react'
import ReactTooltip from 'react-tooltip'
import cx from 'classnames'
import Modal from 'components/Modal'
import Button from 'components/Button'
import { Link } from 'react-router-dom'
import HashAvatar from 'components/HashAvatar'
import { presentHolofuelAmount } from 'utils'
import CopyAgentId from 'holofuel/components/CopyAgentId'
import {
  HOME_PATH,
  INBOX_PATH,
  HISTORY_PATH
} from 'holofuel/utils/urls'

import './SideMenu.module.css'

const DisplayBalance = ({ holofuelBalance }) => {
  if (isNaN(holofuelBalance)) return <>-- TF</>
  else return <>{presentHolofuelAmount(holofuelBalance)} TF</>
}

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

        <span styleName='header-account' data-testid='sidemenu-agentname'>
          <CopyAgentId agent={agent} isMe>
            {agent.nickname || agentLoading}
          </CopyAgentId>
        </span>
        <strong styleName='header-balance'>
          <DisplayBalance holofuelBalance={holofuelBalance} />
        </strong>
      </header>

      <nav styleName='nav'>
        <ul styleName='nav-list'>
          <li>
            <Link to={HOME_PATH} styleName='nav-link'>
              <div styleName='nav-icon' />
              Home
            </Link>
          </li>
          <li>
            <Link to={INBOX_PATH} styleName='nav-link' data-testid='inbox-link'>
              <div styleName='nav-icon' />
              Inbox
              {inboxCount > 0 && <span styleName='nav-badge'>{inboxCount}</span>}
            </Link>
          </li>
          <li>
            <Link to={HISTORY_PATH} styleName='nav-link' data-testid='history-link'>
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
        <div styleName='alpha-info'>
          <p>
            HoloFuel is in Alpha testing.
          </p>
          <p>
            Learn more about out our&nbsp;
            <a href='http://holo.host/alpha-terms' target='_blank' rel='noopener noreferrer' styleName='alpha-link'>
              Alpha Testnet.
            </a>
          </p>
        </div>

        <ul styleName='footer-list'>
          <li>
            <a href='https://forum.holo.host' target='_blank' rel='noopener noreferrer' styleName='footer-link'>Help</a>
          </li>
          <li>
            <a href='http://holo.host/alpha-terms' target='_blank' rel='noopener noreferrer' styleName='footer-link'>View Terms of Service</a>
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
