import React from 'react'
import PrimaryLayout from 'components/layout/PrimaryLayout'
import './FactoryResetInstructions.module.css'

export default function FactoryResetInstructions () {
  return <PrimaryLayout headerProps={{ title: 'Factory Reset' }}>
    <div styleName='content'>
      Here are the intructions for resetting your device.
    </div>
    <h3>Step 1</h3>
    <div styleName='content'>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    </div>
    <h3>Step 2</h3>
    <div styleName='content'>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    </div>
  </PrimaryLayout>
}
