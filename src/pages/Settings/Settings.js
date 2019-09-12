import React, { useState } from 'react'
import useForm from 'react-hook-form'
import * as yup from 'yup'
import Header from 'components/Header'
import Button from 'components/Button'

import './Settings.module.css'

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
  toggleSshAccess
}) {
  const { register, handleSubmit, errors } = useForm({
    defaultValues: settings,
    validationSchema: SettingsValidationSchema
  })

  const [sshAccessVal, setSshAccess] = useState(false)

  const handleToggleSshAccess = (e) => {
    e.preventDefault()
    setSshAccess(e.target.checked)
    toggleSshAccess()
  }

  const onSubmit = settings => {
    updateSettings(settings)
  }

  console.log('Settings form errors (leave here until proper error handling is implemented):', errors)

  return <React.Fragment>
    <Header title='HoloPort Settings' />

    <strong style={{ marginTop: '20px' }}>Name</strong>
    <p>
      {settings.deviceName}
    </p>

    <strong>URL</strong>
    <p>
      {settings.hostUrl}
    </p>

    <strong>Network ID</strong>
    <p>
      {settings.networkId}
    </p>

    <strong>Access Port Numbers</strong>

    <form styleName='settings-form' onSubmit={handleSubmit(onSubmit)}>
      <SettingsFormInput
        label='Device Admin'
        name='deviceAdminPort'
        register={register} />

      <SettingsFormInput
        label='HC Admin'
        name='hcAdminPort'
        register={register} />

      <SettingsFormInput
        label='HC Network'
        name='hcNetworkPort'
        register={register} />

      <SettingsFormInput
        label='Hosting'
        name='hostingPort'
        register={register} />

    </form>

    <Button type='submit' styleName='saveChanges' wide primary name='update-settings' value='Submit'>Save Changes</Button>

    <hr />

    <h2 >Support Access and Factory Reset</h2>

    <SettingsFormInput
      label='Access for HoloPort support (SSH)'
      name='sshAccess'
      type='checkbox'
      checked={sshAccessVal}
      onChange={handleToggleSshAccess} />

    <Button name='factory-reset' styleName='factoryReset' wide primary onClick={() => factoryReset()}>Factory Reset</Button>
  </React.Fragment>
}

export function SettingsFormInput ({
  name,
  label,
  type = 'text',
  register,
  ...inputProps
}) {
  return <React.Fragment>
    {label && <label styleName='settingsLabel' data-for={name}>{label}</label>}
    <input styleName='settingsInput' name={name} id={name} type={type} ref={register} {...inputProps} />
  </React.Fragment>
}

const mockedProps = {
  settings: {
    hostName: 'My Host',
    hostUrl: 'https://288f092.holo.host',
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
