import React from 'react'
import Button from 'components/Button'
import './Header.module.css'
import { withRouter } from 'react-router'
import MenuIcon from 'components/icons/MenuIcon'
// import BackIcon from 'components/icons/BackIcon'
// import { gray } from 'utils/colors'

export function Header ({ title, backTo, history: { push } }) {
  const goToMenu = () => push('/dashboard')
  // const goBack = () => push(backTo)

  const leftNav = <Button onClick={goToMenu} styleName='menu-button' dataTestId='menu-button'>
    <MenuIcon styleName='menu-icon' color='#FFF' />
  </Button>

  return <div>
    <div styleName='header'>
      <div styleName='left-nav'>{leftNav}</div>
      <div styleName='title'>My HoloPort</div>
      <div styleName='empty-spacer' />
    </div>
    {title && <div styleName='subHeader'>
      <div styleName='subTitle'>{title}</div>
    </div>}
  </div>
}

export default withRouter(Header)
