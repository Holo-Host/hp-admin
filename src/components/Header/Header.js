import React from 'react'
import { Link } from 'react-router-dom'
import GearIcon from 'components/icons/GearIcon'
import ArrowRightIcon from 'components/icons/ArrowRightIcon'
import './Header.module.css'

export default function Header ({ title, settings, showBackButton }) {
  return <div styleName='header'>
    {showBackButton && <Link to='/admin' styleName='back-button'>
      <ArrowRightIcon styleName='arrow-icon' color={'#979797'} />
      <div styleName='back-text'>Back</div>
    </Link>}
    {!showBackButton && <div styleName='nickname'>{settings.hostName || 'HoloPort'}</div>}
    <h1 styleName='title'>{title}</h1>
    <Link to='/admin/settings' styleName='settings-link' data-testid='settings-link'>
      <GearIcon />
    </Link>
  </div>
}
