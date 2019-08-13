import React from 'react'
import Button from 'components/Button'
import './Settings.module.css'

export default function Settings ({
  sshAccess,
  history: { push }
}) {
  console.log('!!!!', sshAccess)
  const goToMenu = () => push('/menu')

  return <div>
    <div styleName='header'>
      <span styleName='title'>hApps</span>
      <Button onClick={goToMenu} styleName='menu-button'>Menu</Button>
    </div>
    <form styleName='settings-form'>
      <label data-for='ssh-access'>SSH Access</label>
      <input type='checkbox' name='ssh-access' checked={sshAccess} />

      <label data-for='registration-email'>Registration Email</label>
      <input name='registration-email' />

      <button name='factory-reset'>Factory Reset</button>
    </form>
  </div>
}
