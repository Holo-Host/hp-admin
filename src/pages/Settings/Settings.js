import React, { useState } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { isEmpty } from 'lodash/fp'
import './Settings.module.css'
import { presentAgentId as presentHash } from 'utils'
import HashAvatar from 'components/HashAvatar'
import Modal from 'components/Modal'
import PrimaryLayout from 'components/layout/PrimaryLayout'
import Button from 'components/Button'
import HposSettingsQuery from 'graphql/HposSettingsQuery.gql'
import HposStatusQuery from 'graphql/HposStatusQuery.gql'
import HposUpdateVersionMutation from 'graphql/HposUpdateVersionMutation.gql'
// import useForm from 'react-hook-form'
// import * as yup from 'yup'
// import Input from 'components/Input'

const createLabel = (string) => {
  const label = string.replace('[A-Z]', ' $0').capitalize
  console.log('THIS IS YOUR NEW LABEL >>>>>>>>>> : ', label)
  return label
}

// const portValidationRules = yup.number()
//   .typeError('Port must be specified.') // TypeError because empty value gets cast into NaN
//   .min(1000, 'Ports must be between 1000 and 65000.')
//   .max(65000, 'Ports must be between 1000 and 65000.')
//   .required()

// const SettingsValidationSchema = yup.object().shape({
//   hostName: yup.string().required(),
//   hostPubKey: yup.string().required(),
//   registrationEmail: yup.string()
//     .email()
//     .required(),
//   deviceName: yup.string().required(),
//   networkId: yup.string().required(),
//   deviceAdminPort: portValidationRules,
//   hcAdminPort: portValidationRules,
//   hcNetworkPort: portValidationRules,
//   hostingPort: portValidationRules
// })

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

// Data - Mutation hook with refetch:
function useUpdateVersion () {
  const [hposUpdateVersion] = useMutation(HposUpdateVersionMutation)
  return (id) => hposUpdateVersion({
    variables: { transactionId: id }
  })
}

export function Settings ({
  // settings,
  // updateSettings,
  // toggleSshAccess,
  history: { push }
}) {
  const { data: { hposSettings: settings = [] } = {} } = useQuery(HposSettingsQuery)
  const { data: { hposStatus: status = [] } = {} } = useQuery(HposStatusQuery)

  const updateVersion = useUpdateVersion()
  const [updateAvailable, setUpdateAvailable] = useState(false)
  if (status.versionInfo.availableVersion !== status.versionInfo.currentVersion) setUpdateAvailable(true)

  const [softwareUpdateVersion, setSoftwareUpdateVersion] = useState()
  const showSoftwareUpdateModal = availableVersion => setSoftwareUpdateVersion(availableVersion)

  // const [sshAccessVal, setSshAccess] = useState(false)
  // const handleToggleSshAccess = (e) => {
  //   e.preventDefault()
  //   setSshAccess(e.target.checked)
  //   toggleSshAccess()
  // }
  //
  // const { register, handleSubmit, errors } = useForm({
  //   defaultValues: settings,
  //   validationSchema: SettingsValidationSchema
  // })
  //
  // const onSubmit = settings => {
  //   updateSettings(settings)
  // }

  return <PrimaryLayout headerProps={{ title: 'HoloPort Settings' }}>
    <header className='jumbotron'>
      <HashAvatar seed={settings.hostPubKey} styleName='avatar-image' />
      <h2> {`${settings.hostName}'s` || 'Your'} HoloPort </h2>

      {/* TODO: Find out what the below number should represent?  - If it should represent the HPOS Device, ...then this info/data is now returned as a name >> IE: {settings.deviceName}. */}
      <p> 80348F</p>
    </header>

    <section styleName='hpos-settings'>
      <SettingsTable header='Software Version' updateAvailable={updateAvailable}>
        {!isEmpty(settings.versionInfo) && <SettingsRow
          label={presentHash(settings.versionInfo.currentVersion)}
          content={settings.versionInfo.availableVersion}
          showSoftwareUpdateModal={showSoftwareUpdateModal}
          updateAvailable={updateAvailable}
          versionTable />
        }
      </SettingsTable>

      <SettingsTable header='About this HoloPort' >
        {!isEmpty(settings) && <SettingsRow
          label='Device Name'
          content={settings.deviceName}
          showSoftwareUpdateModal={showSoftwareUpdateModal} />
        }

        {!isEmpty(status) && <SettingsRow
          label='Network ID'
          content={status.networkId}
          showSoftwareUpdateModal={showSoftwareUpdateModal} />
        })}
      </SettingsTable>

      <SettingsTable header='Access Port Numbers'>
        {!isEmpty(settings.ports) && Object.entries(settings.ports).map((port, index) => {
          return <SettingsRow
            label={createLabel(port[0])}
            content={port[1]}
            showSoftwareUpdateModal={showSoftwareUpdateModal} />
        })}
      </SettingsTable>
    </section>

    <UpdateSoftwareModal
      settings={settings}
      handleClose={() => setSoftwareUpdateVersion(null)}
      availableVersion={softwareUpdateVersion}
      updateVersion={updateVersion} />

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

export function SettingsTable ({ updateAvailable, header, children }) {
  return <table styleName='settings-table' data-testid='settings-table'>
    <thead>
      <tr key='heading'>
        <th id={header.toLowerCase().trim()} styleName='settings-row-header'>
          {header}
        </th>
        { updateAvailable
          ? <th id='updateSoftwareNotice' styleName='settings-row-header red-text'>
            Update Available
          </th>
          : null
        }
      </tr>
    </thead>
    <tbody>
      {children}
    </tbody>
  </table>
}

export function SettingsRow ({ label, content, showSoftwareUpdateModal, updateAvailable, versionTable }) {
  return <tr key={content} styleName='settings-row' data-testid='settings-row'>
    <td styleName='settings-col row-label'>
      <h4 data-testid='settings-label'>{label}</h4>
    </td>
    <td styleName='settings-col row-content align-left'>
      { updateAvailable && versionTable
        ? <SoftwareUpdateButton availableVersion={content} showSoftwareUpdateModal={showSoftwareUpdateModal} />
        : versionTable
          ? <h4>Your Software is up-to-date</h4>
          : <h4>{content}</h4>
      }
    </td>
  </tr>
}

function SoftwareUpdateButton ({ availableVersion, showSoftwareUpdateModal }) {
  return <Button
    onClick={() => showSoftwareUpdateModal(availableVersion)}
    styleName='update-version-button'>
    Update Software
  </Button>
}

export function UpdateSoftwareModal ({ availableVersion, updateVersion, handleClose, settings }) {
  if (!availableVersion) return null
  const onYes = () => {
    updateVersion(availableVersion)
    handleClose()
  }
  return <Modal
    contentLabel={`Update your ${settings.deviceName}?`}
    isOpen={!!availableVersion}
    handleClose={handleClose}
    styleName='modal'>
    <div styleName='modal-title'>Are you sure?</div>
    <div styleName='modal-text' role='heading'>
      Do you wish to confirm ?
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

export default props => <Settings {...mockedProps} {...props} />
