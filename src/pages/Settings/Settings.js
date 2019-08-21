import React, { useState } from 'react'
import useForm from 'react-hook-form'
import * as yup from 'yup'
import Button from 'components/Button'

import './Settings.module.css'

export const PORT_NUMBER_REGEX = /^\d{4,6}$/
export const EMAIL_REGEX = /^\S+@\S+$/i

const SettingsValidationSchema = yup.object().shape({
  hostName: yup.string().required(),
  hostPubKey: yup.string().required(),
  registrationEmail: yup.string()
    .email()
    .required(),
  deviceName: yup.string().required(),
  networkId: yup.string().required(),
  deviceAdminPort: yup.number()
    .min(1000)
    .max(65000)
    .required(),
  hcAdminPort: yup.number()
    .min(1000)
    .max(65000)
    .required(),
  hcNetworkPort: yup.number()
    .min(1000)
    .max(65000)
    .required(),
  hostingPort: yup.number()
    .min(1000)
    .max(65000)
    .required()
})

export function Settings ({
  settings,
  updateSettings,
  factoryReset,
  toggleSshAccess,
  history: { push }
}) {
  // if (props.loading) return <h4>Loading Settings</h4>

  const goToMenu = () => push('/menu')
  const { register, handleSubmit, errors } = useForm({
    defaultValues: settings,
    validationSchema: SettingsValidationSchema
  })

  const [sshAccessVal, setSshAccess] = useState(false)

  const handleViewTos = (e) => {
    e.preventDefault()
    push('/tos')
  }

  const handleToggleSshAccess = (e) => {
    e.preventDefault()
    setSshAccess(e.target.checked)
    toggleSshAccess()
  }

  const onSubmit = settings => {
    updateSettings(settings)
  }

  console.log('!!! errors: ', errors)

  return <div>
    <div styleName='header'>
      <span styleName='title'>HoloPort Settings</span>
      <Button onClick={goToMenu} styleName='menu-button'>Menu</Button>
    </div>
    <div>
      <form styleName='settings-form' onSubmit={handleSubmit(onSubmit)}>
        <SettingsFormInput
          label='Host Name'
          name='hostName'
          register={register} />

        <SettingsFormInput
          label='Host ID (Host Public Key)'
          name='hostPubKey'
          register={register} />

        <SettingsFormInput
          label='Registration Email'
          name='registrationEmail'
          register={register} />

        <SettingsFormInput
          label='Device Name'
          name='deviceName'
          register={register} />

        <SettingsFormInput
          label='Network ID'
          name='networkId'
          register={register} />

        <SettingsFormInput
          label='Device Admin Port'
          name='deviceAdminPort'
          register={register} />

        <SettingsFormInput
          label='Holochain Admin Port'
          name='hcAdminPort'
          register={register} />

        <SettingsFormInput
          label='Holochain Networking Port'
          name='hcNetworkPort'
          register={register} />

        <SettingsFormInput
          label='Holo Hosting Port'
          name='hostingPort'
          register={register} />

        <SettingsFormInput
          label='SSH Access'
          name='sshAccess'
          type='checkbox'
          checked={sshAccessVal}
          onChange={handleToggleSshAccess} />

        <hr />

        <Button type='submit' name='update-settings' value='Submit'>Update</Button>
      </form>
      <Button name='factory-reset' onClick={() => factoryReset()}>Factory Reset</Button>
      <Button name='tos' onClick={handleViewTos} styleName='tos-button'>Review Terms of Service</Button>
    </div>
  </div>
}

export function SettingsFormInput ({
  name,
  label,
  type = 'text',
  register,
  ...inputProps
}) {
  return <React.Fragment>
    {label && <label data-for={name}>{label}</label>}
    <input name={name} id={name} type={type} ref={register} {...inputProps} />
  </React.Fragment>
}

const mockedProps = {
  settings: {
    hostName: 'My Host',
    hostPubKey: 'hcsFAkeHashSTring2443223ee',
    registrationEmail: 'iamahost@hosting.com',
    deviceName: 'My Very First HoloPort',
    networkId: 'my-holoport',
    sshAccess: false,
    deviceAdminPort: 6609,
    hcAdminPort: 8800,
    hcNetworkPort: 35353,
    hostingPort: 8080
  },
  updateSettings: () => Promise.resolve(true),
  factoryReset: () => Promise.resolve(true),
  toggleSshAccess: () => Promise.resolve(true)
}

export default props => <Settings {...mockedProps} {...props} />
