import React from 'react'
import { Link } from 'react-router-dom'
import GearIcon from 'components/icons/GearIcon'
import ArrowRightIcon from 'components/icons/ArrowRightIcon'
import { isPage } from 'utils/urls'
import './Header.module.css'

export default function Header ({ title, settings, showBackButton }) {
  return <div styleName='header'>
    {showBackButton && <Link to='/admin' styleName='back-button'>
      <ArrowRightIcon styleName='arrow-icon' color={'#979797'} />
      <div styleName='back-text'>Back</div>
    </Link>}
    {/* Q1: Why is the default for the agent's nicknae, 'HoloPort'? */}
    {/* Q2: What happened to the option to rename your agent? */}
    {!showBackButton && <div styleName='nickname'>{settings.hostName || 'HoloPort'}</div>}
    <h1 styleName='title'>{title}</h1>
    { !isPage('settings', window)
      ? <Link to='/admin/settings' styleName='settings-link' data-testid='settings-link'>
        <GearIcon />
      </Link>
      : < div styleName='settings-link'/>}
  </div>
}
