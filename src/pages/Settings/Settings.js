import React, { useState } from 'react'
import useForm from 'react-hook-form'
import * as yup from 'yup'
import Header from 'components/Header'
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
  const goToMenu = () => push('/menu')
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

  return <>
    <Header title='HoloPort Settings' />

    <div>
      <label>Name</label>
      <p>{settings.deviceName}</p>

      <label>URL</label>
      <p>{settings.hostUrl}</p>

      <label>URL</label>
      <p>{settings.networkId}</p>

      <h2>Access Port Numbers</h2>

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

        <Button type='submit' name='update-settings' value='Submit'>Update</Button>
      </form>

      <hr />

      <h2 >Support Access and Factory Reset</h2>

      <SettingsFormInput
        label='Turn on access for HoloPort support (SSH)'
        name='sshAccess'
        type='checkbox'
        checked={sshAccessVal}
        onChange={handleToggleSshAccess} />

      <Button name='factory-reset' onClick={() => factoryReset()}>Factory Reset</Button>
    </div>
  </>
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
