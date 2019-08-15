import React, { useState } from 'react'
import Button from 'components/Button'
import './Settings.module.css'
import { useInput } from '../../utils/index'
import FormInput from 'components/FormInput'
import EditIcon from 'utils/icons/EditIcon'

export default function Settings ({
  allHPSettings,
  updateHPSettings,
  factoryReset,
  toggleSshAccess,
  history: { push }
}) {
  console.log('allHPSettings : ', allHPSettings)
  console.log('updateHPSettings : ', updateHPSettings)
  console.log('factoryReset : ', factoryReset)
  console.log('toggleSshAccess : ', toggleSshAccess)
  
  const goToMenu = () => push('/menu')
  const { hostName, hostPubKey, hostEmail, deviceName, networkId, sshAccess, ports } = allHPSettings
  const [sshAccessVal, setSshAccess] = useState(false)
  const { value: hostNameVal, bind: bindhostName, reset: resethostName } = useInput(hostName)
  const { value: hostPubKeyVal, bind: bindHostPubKey, reset: resetHostPubKey } = useInput(hostPubKey)
  const { value: registrationEmail, bind: bindRegistrationEmail, reset: resetRegistrationEmail } = useInput(hostEmail)
  const { value: deviceNameVal, bind: bindDeviceName, reset: resetDeviceName } = useInput(deviceName)
  const { value: networkIdVal, bind: bindNetworkId, reset: resetNetworkId } = useInput(networkId)
  const { value: deviceAdminPortVal, bind: bindDeviceAdminPort, reset: resetDeviceAdminPort } = useInput(ports.deviceAdminPort)
  const { value: hcAdminPortVal, bind: bindHcAdminPort, reset: resetHcAdminPort } = useInput(ports.hcAdminPort)
  const { value: hcNetworkPortVal, bind: bindHcNetworkPort, reset: resetHcNetworkPort } = useInput(ports.hcNetworkPort)
  const { value: hostingPortVal, bind: bindHostingPort, reset: resetHostingPort } = useInput(ports.hostingPort)

  const handleViewTos = (e) => {
    e.preventDefault()
    push('/tos')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log(`Submitting form > INITIAL values from props : `, hostName, hostPubKey, hostEmail, deviceName, networkId, sshAccess)
    console.log(`Submitting form > UPDATED values `, hostNameVal, hostPubKeyVal, registrationEmail, deviceNameVal, networkIdVal, sshAccessVal)

    const newSettings = {
      hostName: hostNameVal,
      hostPubKey: hostPubKeyVal,
      hostEmail: registrationEmail,
      deviceName: deviceNameVal,
      networkId: networkIdVal,
      sshAccess: sshAccessVal,
      ports: {
        deviceAdminPort: deviceAdminPortVal,
        hcAdminPort: hcAdminPortVal,
        hcNetworkPort: hcNetworkPortVal,
        hostingPort: hostingPortVal
      }
    }
    updateHPSettings(newSettings)

    resetRegistrationEmail()
    resethostName()
    resetHostPubKey()
    resetDeviceName()
    resetNetworkId()
    resetDeviceAdminPort()
    resetHcAdminPort()
    resetHcNetworkPort()
    resetHostingPort()
  }

  return <div>
    <div styleName='header'>
      <span styleName='title'>HoloPort Settings</span>
      <Button onClick={goToMenu} styleName='menu-button'>Menu</Button>
    </div>

    <div>
      <form styleName='settings-form' onSubmit={handleSubmit}>
        <SettingInput
          value={hostNameVal}
          label='Host Name'
          dataFor='hostName'
          type='text'
          name='hostName'
          bindFnName={bindhostName} />

        <SettingInput
          value={hostPubKeyVal}
          label='Host ID (Host Public Key)'
          dataFor='hostPubKey'
          type='text'
          name='hostPubKey'
          bindFnName={bindHostPubKey} />

        <SettingInput
          value={registrationEmail}
          label='Registration Email'
          dataFor='registration-email'
          type='text'
          name='registration-email'
          bindFnName={bindRegistrationEmail} />

        <SettingInput
          value={deviceNameVal}
          label='Device Name'
          dataFor='deviceName'
          type='text'
          name='deviceName'
          bindFnName={bindDeviceName} />

        <SettingInput
          value={networkIdVal}
          label='Network Id'
          dataFor='networkId'
          type='text'
          name='networkId'
          bindFnName={bindNetworkId} />

        <SettingInput
          value={deviceAdminPortVal}
          label='HoloPort Admin Port Id'
          dataFor='hpAdminPortId'
          type='text'
          name='hpAdminPortId'
          bindFnName={bindDeviceAdminPort} />

        <SettingInput
          value={hcAdminPortVal}
          label='Holochain Admin Port Id'
          dataFor='hcAdminPort'
          type='text'
          name='hcAdminPort'
          bindFnName={bindHcAdminPort} />

        <SettingInput
          value={hcNetworkPortVal}
          label='Holochain Networking Port Id'
          dataFor='hcNetworkPort'
          type='text'
          name='hcNetworkPort'
          bindFnName={bindHcNetworkPort} />
         
        <SettingInput
          value={hostingPortVal}
          label='Holo Hosting Port Id'
          dataFor='hostingPort'
          type='text'
          name='hostingPort'
          bindFnName={bindHostingPort} />

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

      <Button name='tos' onClick={handleViewTos} styleName='tos-button'>Review Terms of Service</Button>
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
