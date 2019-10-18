import React, { useState } from 'react'
import useForm from 'react-hook-form'
import * as yup from 'yup'
import PrimaryLayout from 'components/layout/PrimaryLayout'
import Button from 'components/Button'
import Input from 'components/Input'

import './Settings.module.css'

const portValidationRules = yup.number()
  .typeError('Port must be specified.') // TypeError because empty value gets cast into NaN
  .min(1000, 'Ports must be between 1000 and 65000.')
  .max(65000, 'Ports must be between 1000 and 65000.')
  .required()
const SettingsValidationSchema = yup.object().shape({
  hostName: yup.string().required(),
  hostPubKey: yup.string().required(),
  registrationEmail: yup.string()
    .email()
    .required(),
  deviceName: yup.string().required(),
  networkId: yup.string().required(),
  deviceAdminPort: portValidationRules,
  hcAdminPort: portValidationRules,
  hcNetworkPort: portValidationRules,
  hostingPort: portValidationRules
})

export function Settings ({
  settings,
  updateSettings,
  history: { push },
  toggleSshAccess
}) {
  const { register, handleSubmit, errors } = useForm({
    defaultValues: settings,
    validationSchema: SettingsValidationSchema
  })

  const [softwareUpdatelVersion, setSoftwareUpdateVersion] = useState()
  const showSoftwareUpdateModal = availableVersion => setSoftwareUpdateVersion(availableVersion)
  
  const [sshAccessVal, setSshAccess] = useState(false)
  const handleToggleSshAccess = (e) => {
    e.preventDefault()
    setSshAccess(e.target.checked)
    toggleSshAccess()
  }

  const onSubmit = settings => {
    updateSettings(settings)
  }

  return <PrimaryLayout headerProps={{ title: 'HoloPort Settings' }}>
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
{/* 
    <form styleName='settings-form' onSubmit={handleSubmit(onSubmit)}>
      <SettingsFormInput
        label='Device Admin'
        name='deviceAdminPort'
        register={register}
        errors={errors} />

      <SettingsFormInput
        label='HC Admin'
        name='hcAdminPort'
        register={register}
        errors={errors} />

      <SettingsFormInput
        label='HC Network'
        name='hcNetworkPort'
        register={register}
        errors={errors} />

      <SettingsFormInput
        label='Hosting'
        name='hostingPort'
        register={register}
        errors={errors} />

      <Button variant='primary' wide name='update-settings' value='Submit'>Save Changes</Button>
    </form> */}

    <section styleName='account-ledger-table'>
      {!isEmpty(pendingTransactions) && pendingTransactions.map((pendingTx, index) => {
        return <SettingsRow
          header='Software Version'
          key={index}
          showSoftwareUpdateModal={showSoftwareUpdateModal}
          updateAvailable={updateAvailable}
        />
      })}

      {!isEmpty(completedTransactions) && completedTransactions.map((completeTx, index) => {
        return <SettingsRow
          header='About this HoloPort'
          key={index}
          showSoftwareUpdateModal={showSoftwareUpdateModal}
          completed />
      })}

      {!isEmpty(completedTransactions) && completedTransactions.map((completeTx, index) => {
        return <SettingsRow
          header='Acess Port Numbers'
          key={index}
          showSoftwareUpdateModal={showSoftwareUpdateModal}
          completed />
      })}
    </section>

    <UpdateSoftwareModal
      handleClose={() => setModalTransaction(null)}
      transaction={modalTransaction} />

    <hr />

    <hr />

    <h2 >Support Access and Factory Reset</h2>
    {/* <SettingsFormInput
      label='Access for HoloPort support (SSH)'
      name='sshAccess'
      type='checkbox'
      checked={sshAccessVal}
      onChange={handleToggleSshAccess} /> */}

    <Button name='factory-reset' variant='danger' wide onClick={() => push('/factory-reset')}>Factory Reset</Button>
  </PrimaryLayout>
}

export function SettingsRow ({ header, label, content, key, showSoftwareUpdateModal, updateAvailable }) {
  return <table styleName='completed-transactions-table'>
    <thead>
      <tr key='heading'>
        <th id={`${header.toLowerCase().trim()}-row-${key}`} styleName='settings-row-header'>
          {header}
        </th>
        { updateAvailable
          ? <th id={`updateSoftwareNotice-row-${key}`} styleName='settings-row-header red-text'>
            Update Available
          </th>
          : null
        }
      </tr>
    </thead>
    <tbody>
      <tr key={key} styleName='settings-row' data-testid='settings-row'>
        <td styleName='settings-col row-label'>
          <h4 data-testid='settings-label'>{label}</h4>
        </td>
        <td styleName='settings-col row-content align-left'>
          { updateAvailable && header === 'Software Version'
            ? <SoftwareUpdateButton availableVersion={content} showSoftwareUpdateModal={showSoftwareUpdateModal} />
            : updateAvailable
              ? <h4>Your Software is up-to-date</h4>
              : <h4>{content}</h4>
          }
        </td>
      </tr>
    </tbody>
  </table>
}

function SoftwareUpdateButton ({ softwareUpdateModal, availableVersion }) {
  return <Button
    onClick={() => softwareUpdateModal(availableVersion)}
    styleName='update-version-button'>
    Update Software
  </Button>
}

export function UpdateSoftwareModal ({ availableVersion, handleClose }) {
  if (!transaction) return null
  const { id, counterparty, amount, type, direction } = transaction
  const onYes = () => {
    cancelTransaction(id)
    handleClose()
  }
  return <Modal
    contentLabel={`Cancel ${type}?`}
    isOpen={!!transaction}
    handleClose={handleClose}
    styleName='modal'>
    <div styleName='modal-title'>Are you sure?</div>
    <div styleName='modal-text' role='heading'>
      Cancel your {capitalize(type)} {direction === 'incoming' ? 'for' : 'of'} <span styleName='modal-amount' data-testid='modal-amount'>{presentHolofuelAmount(amount)} HF</span> {direction === 'incoming' ? 'from' : 'to'} <span styleName='modal-counterparty' testid='modal-counterparty'> {counterparty.nickname || presentAgentId(counterparty.id)}</span> ?
    </div>
    <div styleName='modal-buttons'>
      <Button
        onClick={handleClose}
        styleName='modal-button-no'>
        No
      </Button>
      <Button
        onClick={onYes}
        styleName='modal-button-yes'>
        Yes
      </Button>
    </div>
  </Modal>
}

// export function SettingsFormInput ({
//   name,
//   label,
//   type = 'number',
//   register,
//   errors = {},
//   ...inputProps
// }) {
//   return <>
//     {label && <label styleName='settingsLabel' htmlFor={name}>{label}</label>}
//     <Input name={name} id={name} type={type} placeholder={label} ref={register} {...inputProps} />
//     {errors[name] && <small styleName='field-error'>{errors[name].message}</small>}
//   </>
// }

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
