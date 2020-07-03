import React from 'react'
import HashAvatar from 'components/HashAvatar'
import './Header.module.css'
import { Link } from 'react-router-dom'
import useCurrentUserContext from 'contexts/useCurrentUserContext'

export default function Header ({ title, nickname }) {
  const { currentUser } = useCurrentUserContext()

  return <div styleName='header'>
    <div styleName='nickname'>nickname</div>
    <h1 styleName='title'>{title}</h1>
    <Link to='/admin/settings' styleName='avatar-link' data-testid='avatar-link'>
      <HashAvatar seed={currentUser.hostPubKey} size={32} />
    </Link>
  </div>
}
