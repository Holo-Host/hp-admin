import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import HposSettingsQuery from 'graphql/HposSettingsQuery.gql'
import Button from 'components/Button'
import HashAvatar from 'components/HashAvatar'
import './Header.module.css'
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'
import MenuIcon from 'components/icons/MenuIcon'

export function Header ({ title, avatarUrl, email, backTo, history: { push }, hamburgerClick = () => push('/dashboard') }) {
  const { data: { hposSettings: settings = [] } = {} } = useQuery(HposSettingsQuery)

  const leftNav = <Button onClick={hamburgerClick} styleName='menu-button' dataTestId='menu-button'>
    <MenuIcon styleName='menu-icon' color='#FFF' />
  </Button>

  return <header>
    <section styleName='header'>
      <div styleName='left-nav'>{leftNav}</div>
      <div styleName='title'>My HoloPort</div>
      <Link to='/my-profile' styleName='avatar-link'>
        <HashAvatar avatarUrl={avatarUrl} seed={settings.hostPubKey} size={32} />
      </Link>
    </section>
    {title && <section styleName='sub-header'>
      <div id='sub=title' styleName='sub-title'>{title}</div>
    </section>}
  </header>
}

export default withRouter(Header)
