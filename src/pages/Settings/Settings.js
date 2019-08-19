import React, { useState, useEffect } from 'react'
import Button from 'components/Button'
import { useInput } from 'utils'
import FormInput from 'components/FormInput'
import EditIcon from 'utils/icons/EditIcon'
import './Settings.module.css'

export default function Settings (props) {
  console.log('inside Settings Wrapper : ', props.allHPSettings)
  if (props.allHPSettings) {
    return <SettingsDisplay {...props} />
  } else {
    return <h4>Loading Settings</h4>
  }
}

function SettingsDisplay ({
  allHPSettings,
  updateHPSettings,
  factoryReset,
  toggleSshAccess,
  history: { push }
}) {
  const goToMenu = () => push('/menu')
  const { hostName, hostPubKey, hostEmail, deviceName, networkId, sshAccess, deviceAdminPort,hcAdminPort, hcNetworkPort, hostingPort } = allHPSettings
  const [sshAccessVal, setSshAccess] = useState(false)
  const { value: hostNameVal, bind: bindhostName, reset: resethostName } = useInput(hostName)
  const { value: hostPubKeyVal, bind: bindHostPubKey, reset: resetHostPubKey } = useInput(hostPubKey)
  const { value: registrationEmail, bind: bindRegistrationEmail, reset: resetRegistrationEmail } = useInput(hostEmail)
  const { value: deviceNameVal, bind: bindDeviceName, reset: resetDeviceName } = useInput(deviceName)
  const { value: networkIdVal, bind: bindNetworkId, reset: resetNetworkId } = useInput(networkId)
  const { value: deviceAdminPortVal, bind: bindDeviceAdminPort, reset: resetDeviceAdminPort } = useInput(deviceAdminPort)
  const { value: hcAdminPortVal, bind: bindHcAdminPort, reset: resetHcAdminPort } = useInput(hcAdminPort)
  const { value: hcNetworkPortVal, bind: bindHcNetworkPort, reset: resetHcNetworkPort } = useInput(hcNetworkPort)
  const { value: hostingPortVal, bind: bindHostingPort, reset: resetHostingPort } = useInput(hostingPort)

  const handleViewTos = (e) => {
    e.preventDefault()
    push('/tos')
  }

  const handleToggleSshAccess = (e) => {
    e.preventDefault()
    setSshAccess(e.target.checked)
    toggleSshAccess()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('allHPSettings : ', allHPSettings)
    console.log(`Submitting form > INITIAL values (from props): `, hostName, hostPubKey, hostEmail, deviceName, networkId, sshAccess)
    console.log(`Submitting form > UPDATED values: `, hostNameVal, hostPubKeyVal, registrationEmail, deviceNameVal, networkIdVal, sshAccessVal)

    const newSettings = {
      hostName: hostNameVal || hostName,
      hostPubKey: hostPubKeyVal || hostPubKey,
      hostEmail: registrationEmail || hostEmail,
      deviceName: deviceNameVal || deviceName,
      networkId: networkIdVal || networkId,
      sshAccess: sshAccessVal || sshAccess,
      deviceAdminPort: deviceAdminPortVal || deviceAdminPort,
      hcAdminPort: hcAdminPortVal || hcAdminPort,
      hcNetworkPort: hcNetworkPortVal || hcNetworkPort,
      hostingPort: hostingPortVal || hostingPort
    }
    // Submit all/new setting values
    updateHPSettings({ newHPSettings: newSettings })

    // Reset all inputs
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
          propValue={hostName}
          bindFnName={bindhostName} />

        <SettingInput
          value={hostPubKeyVal}
          label='Host ID (Host Public Key)'
          dataFor='hostPubKey'
          type='text'
          name='hostPubKey'
          propValue={hostPubKey}
          bindFnName={bindHostPubKey} />

        <SettingInput
          value={registrationEmail}
          label='Registration Email'
          dataFor='registration-email'
          type='text'
          name='registration-email'
          propValue={hostEmail}
          bindFnName={bindRegistrationEmail} />

        <SettingInput
          value={deviceNameVal}
          label='Device Name'
          dataFor='deviceName'
          type='text'
          name='deviceName'
          propValue={deviceName}
          bindFnName={bindDeviceName} />

        <SettingInput
          value={networkIdVal}
          label='Network Id'
          dataFor='networkId'
          type='text'
          name='networkId'
          propValue={networkId}
          bindFnName={bindNetworkId} />

        <SettingInput
          value={deviceAdminPortVal}
          label='Device Admin Port Id'
          dataFor='deviceAdminPort'
          type='text'
          name='deviceAdminPort'
          propValue={hcAdminPort}
          bindFnName={bindDeviceAdminPort} />

        <SettingInput
          value={hcAdminPortVal}
          label='Holochain Admin Port Id'
          dataFor='hcAdminPort'
          type='text'
          name='hcAdminPort'
          propValue={hcAdminPort}
          bindFnName={bindHcAdminPort} />

        <SettingInput
          value={hcNetworkPortVal}
          label='Holochain Networking Port Id'
          dataFor='hcNetworkPort'
          type='text'
          name='hcNetworkPort'
          propValue={hcNetworkPort}
          bindFnName={bindHcNetworkPort} />

        <SettingInput
          value={hostingPortVal}
          label='Holo Hosting Port Id'
          dataFor='hostingPort'
          type='text'
          name='hostingPort'
          propValue={hostingPort}
          bindFnName={bindHostingPort} />

        <FormInput hasLabel
          label='SSH Access'
          dataFor='ssh-access'
          type='checkbox'
          defaultChecked={sshAccess}
          checked={sshAccessVal}
          onChange={handleToggleSshAccess} />

        <hr />
        <Button type='submit' name='update-settngs' value='Submit'>Update</Button>

      </form>
      <Button name='factory-reset' onClick={() => factoryReset()}>Factory Reset</Button>

      <Button name='tos' onClick={handleViewTos} styleName='tos-button'>Review Terms of Service</Button>
    </div>
  </div>
}

export function SettingInput ({ value, label, dataFor, type, name, bindFnName, propValue }) {
  const [currentValue, setcurrentValue] = useState(propValue)
  const [revertText, setRevertText] = useState(propValue)
  const [clickAmend, setClickAmend] = useState(false)

  // TODO: review the implementation of useEffect
  useEffect(() => {
    if (value) return
    setRevertText(true)
  })

  const renderInput = () => {
    setClickAmend(true)
  }
  const resetText = () => {
    console.log('input propValue: ', propValue)
    setRevertText(true)
    setClickAmend(false)
  }
  const displayNewText = () => {
    setcurrentValue(value)
    setRevertText(false)
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
          onCloseHandler={resetText}
          onCheckHandler={displayNewText} />
        : <div styleName='form-row'>
          <h6 styleName='form-label-header'>{label}</h6>
          <span onClick={renderInput} styleName='side-icon'><EditIcon width={10} height={10} /></span>
          <p styleName='form-label'>{revertText ? currentValue : value}</p>
        </div>
      }
    </div>
  )
}
