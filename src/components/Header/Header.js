import React from 'react'
import { Link } from 'react-router-dom'
import './Header.module.css'
import HashAvatar from 'components/HashAvatar'
import useCurrentUserContext from 'contexts/useCurrentUserContext'

export default function Header ({ title, settings }) {
  const { currentUser } = useCurrentUserContext()

export default function Header ({ title }) {
  return <div styleName='header'>
    <div styleName='nickname'>{settings.hostName || 'HoloPort'}</div>
    <h1 styleName='title'>{title}</h1>
    <Link to='/admin/settings' styleName='avatar-link' data-testid='avatar-link'>
      <HashAvatar seed={currentUser.hostPubKey} size={32} />
    </Link>
    <h1 styleName='title'>{title}</h1>
    <div styleName='left-nav'>
      <Link to='/admin/settings' styleName='settings-link'>
        <GearIcon styleName='gear-icon' />
      </Link>
    </div>
  </div>
}
