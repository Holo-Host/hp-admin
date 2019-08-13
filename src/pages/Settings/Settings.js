import React from 'react'
import './Settings.module.css'

export default function Settings () {
  return <form styleName='settings-form'>
    <label data-for='ssh-access'>SSH Access</label>
    <input type='checkbox' name='ssh-access' />

    <label data-for='registration-email'>Registration Email</label>
    <input name='registration-email' />

    <button name='factory-reset'>Factory Reset</button>
  </form>
}
