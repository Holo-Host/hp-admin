import React, { useState } from 'react'
import Button from 'components/Button'
import './Settings.module.css'
import { useInput } from '../../utils/index'
import FormInput from 'components/FormInput'
import EditIcon from 'utils/icons/EditIcon'

export default function Settings ({
  hostName,
  hostPubKey,
  hostEmail,
  deviceName,
  networkId,
  sshAccess,
  ports,
  factoryReset,
  toggleSshAccess,
  history: { push }
}) {
  const goToMenu = () => push('/menu')
  const [sshAccessVal, setSshAccess] = useState(false)
  const { value: registrationEmail, bind: bindRegistrationEmail, reset: resetRegistrationEmail } = useInput(hostEmail)
  const { value: hostNameVal, bind: bindhostName, reset: resethostName } = useInput(hostName)
  const { value: hostPubKeyVal, bind: bindHostPubKey, reset: resetHostPubKey } = useInput(hostPubKey)
  const { value: deviceNameVal, bind: bindDeviceName, reset: resetDeviceName } = useInput(deviceName)
  const { value: networkIdVal, bind: bindNetworkId, reset: resetNetworkId } = useInput(networkId)

  const handleViewTos = (e) => {
    e.preventDefault()
    push('/tos')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log(`Submitting form > INITIAL values from props : `, hostName, hostPubKey, hostEmail, deviceName, networkId, sshAccess)
    console.log(`Submitting form > UPDATED values `, hostNameVal, hostPubKeyVal, registrationEmail, deviceNameVal, networkIdVal, sshAccessVal)

    resetRegistrationEmail()
    resethostName()
    resetHostPubKey()
    resetDeviceName()
    resetNetworkId()
  }

  return <div>
    <div styleName='header'>
      <span styleName='title'>HoloPort Settings</span>
      <Button onClick={goToMenu} styleName='menu-button'>Menu</Button>
    </div>

    <div>
      <form styleName='settings-form' onSubmit={handleSubmit}>
        <SettingInput
          value={hostName}
          label='Host Name'
          dataFor='hostName'
          type='text'
          name='hostName'
          bindFnName={bindhostName} />

        <SettingInput
          value={hostPubKey}
          label='Host ID (Host Public Key)'
          dataFor='hostPubKey'
          type='text'
          name='hostPubKey'
          bindFnName={bindHostPubKey} />

        <SettingInput
          value={hostEmail}
          label='Registration Email'
          dataFor='registration-email'
          type='text'
          name='registration-email'
          bindFnName={bindRegistrationEmail} />

        <SettingInput
          value={deviceName}
          label='Device Name'
          dataFor='deviceName'
          type='text'
          name='deviceName'
          bindFnName={bindDeviceName} />

        <SettingInput
          value={networkId}
          label='Network Id'
          dataFor='networkId'
          type='text'
          name='networkId'
          bindFnName={bindNetworkId} />

        <SettingInput
          value={ports.deviceAdminPort}
          label='HoloPort Admin Port Id'
          dataFor='hpAdminPortId'
          type='text'
          name='hpAdminPortId'
          bindFnName={bindNetworkId} />

        <SettingInput
          value={ports.hcAdminPort}
          label='Holochain Admin Port Id'
          dataFor='hcAdminPort'
          type='text'
          name='hcAdminPort'
          bindFnName={bindNetworkId} />

        <SettingInput
          value={ports.hcNetworkPort}
          label='Holochain Networking Port Id'
          dataFor='hcNetworkPort'
          type='text'
          name='hcNetworkPort'
          bindFnName={bindNetworkId} />
         
        <SettingInput
          value={ports.hostingPort}
          label='Holo Hosting Port Id'
          dataFor='hostingPort'
          type='text'
          name='hostingPort'
          bindFnName={bindNetworkId} />

        <FormInput hasLabel
          label='SSH Access'
          dataFor='ssh-access'
          type='checkbox'
          // defaultChecked will return the sshAccess boolean value as default
          defaultChecked={sshAccess}
          checked={sshAccessVal}
          // onChange={toggleSshAccess} />
          onChange={e => setSshAccess(e.target.checked)} />

        <hr />
        <Button type='submit' name='update-settngs' value='Submit'>Update</Button>

      </form>
      <Button name='factory-reset' onClick={() => console.log('You pressed factoryReset : ', factoryReset)}>Factory Reset</Button>

      <Button styleName='tos-button' name='tos' onClick={handleViewTos}>Review Terms of Service</Button>
    </div>
  </div>
}

export function SettingInput ({ value, label, dataFor, type, name, bindFnName }) {
  const [clickAmend, setClickAmend] = useState(false)
  const renderInput = () => {
    setClickAmend(true)
  }
  const displayText = () => {
    setClickAmend(false)
  }
  return (
    <div>
      {clickAmend
        ? <FormInput hasLabel
          label={label}
          dataFor={dataFor}
          type={type}
          name={name}
          min='0.5'
          max='100'
          step='0.5'
          {...bindFnName}
          onClickHandler={displayText} />
        : <div styleName='form-row'>
          <h6 styleName='form-label-header'>{label}</h6>
          <span onClick={renderInput} styleName='side-icon'><EditIcon width={10} height={10} /></span>
          <p styleName='form-label'>{value}</p>
        </div>
      }
    </div>
  )
}
