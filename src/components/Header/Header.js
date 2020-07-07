import React from 'react'
import { Link } from 'react-router-dom'
import './Header.module.css'
import BackIcon from 'components/icons/BackIcon'
import GearIcon from 'components/icons/GearIcon'
import { HP_ADMIN_SETTINGS } from 'utils/urls'

export default function Header ({ title }) {
  return <div styleName='header'>
    <Link to='/admin/dashboard' styleName='avatar-link' data-testid='avatar-link'>
      {window.location.pathname === HP_ADMIN_SETTINGS && <BackIcon styleName='back-icon' />}
    </Link>
    <h1 styleName='title'>{title}</h1>
    <div styleName='left-nav'>
      <Link to='/admin/settings' styleName='settings-link'>
        <GearIcon styleName='gear-icon' />
      </Link>
    </div>
  </div>
}
