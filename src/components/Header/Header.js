import React from 'react'
import { Link } from 'react-router-dom'
import HashAvatar from 'components/HashAvatar'
import './Header.module.css'
import useCurrentUserContext from 'contexts/useCurrentUserContext'
import GearIcon from 'components/icons/GearIcon'

export default function Header ({ title, hamburgerClick }) {
  const { currentUser } = useCurrentUserContext()
  const leftNav = hamburgerClick && <Link to='/admin/settings' styleName='settings-link'>
    <GearIcon styleName='gear-icon' />
  </Link>

  return <div styleName='header'>
    <div styleName='left-nav'>{leftNav}</div>
    <h1 styleName='title'>{title}</h1>
    <Link to='/admin/dashboard' styleName='avatar-link' data-testid='avatar-link'>
      <HashAvatar seed={currentUser.hostPubKey} size={32} />
    </Link>
  </div>
}
