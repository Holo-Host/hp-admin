import React, { useState } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { isEmpty, capitalize } from 'lodash/fp'
import './Settings.module.css'
import { presentAgentId as presentHash } from 'utils'
import HashAvatar from 'components/HashAvatar'
import Modal from 'components/Modal'
import PrimaryLayout from 'components/layout/PrimaryLayout'
import Button from 'components/Button'
import HposSettingsQuery from 'graphql/HposSettingsQuery.gql'
import HposStatusQuery from 'graphql/HposStatusQuery.gql'
import HposUpdateVersionMutation from 'graphql/HposUpdateVersionMutation.gql'
// import Input from 'components/Input'

const createLabelfromSnakeCase = string => string.replace(/([A-Z])/g, ' $1').split(' ').map(word => capitalize(word)).join(' ')

const DEFAULT_PORT_NAMES = ['Device Admin', 'HC Network', 'Hosting']
const NOT_AVAILABLE = 'Not Available'

// const mockedProps = {
//   toggleSshAccess: () => Promise.resolve(true)
// }

// Data - Mutation hook with refetch:
function useUpdateVersion () {
  const [hposUpdateVersion] = useMutation(HposUpdateVersionMutation)
  return (id) => hposUpdateVersion({
    variables: { transactionId: id }
  })
}

export function Settings ({
  // toggleSshAccess,
  history: { push }
}) {
  const { data: { hposSettings: settings = [] } = {} } = useQuery(HposSettingsQuery)
  const { data: { hposStatus: status = [] } = {} } = useQuery(HposStatusQuery)

  const updateVersion = useUpdateVersion()
  const [updateAvailable, setUpdateAvailable] = useState(false)
  if (!isEmpty(settings) && !isEmpty(settings.versionInfo) && status.versionInfo.availableVersion !== status.versionInfo.currentVersion) setUpdateAvailable(true)

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
    <header styleName='jumbotron-header'>
      {!isEmpty(settings) && <>
        <HashAvatar seed={settings.hostPubKey} styleName='avatar-image' />
        <h2> {settings.hostName ? `${settings.hostName}'s` : 'Your'} HoloPort </h2>
      </> }
      {/* TODO: Find out what the below number should represent and where it should link to... If it should represent the HPOS Device, ...then this info/data is now returned as a name >> IE: {settings.deviceName}. */}
      <p><a href='#'>80348F</a></p>
    </header>

    <section styleName='settings-section'>
      <SettingsTable header='Software Version' updateAvailable={updateAvailable}>
        {!isEmpty(settings) && !isEmpty(settings.versionInfo)
          ? <SettingsRow
            label={presentHash(settings.versionInfo.currentVersion)}
            content={settings.versionInfo.availableVersion}
            showSoftwareUpdateModal={showSoftwareUpdateModal}
            updateAvailable={updateAvailable}
            versionTable />
          : <SettingsRow
            label='Version Number'
            content={NOT_AVAILABLE} />
        }
      </SettingsTable>

      <SettingsTable header='About this HoloPort' >
        <SettingsRow
          label='Device Name'
          content={settings.deviceName || NOT_AVAILABLE} />
        <SettingsRow
          label='Network ID'
          content={!isEmpty(status) ? status.networkId : NOT_AVAILABLE} />
      </SettingsTable>

      <SettingsTable header='Access Port Numbers'>
        {!isEmpty(settings) && !isEmpty(settings.ports)
          ? Object.entries(settings.ports).map(port => <SettingsRow
            key={port[0] + port[1]}
            label={createLabelfromSnakeCase(port[0])}
            content={port[1]} />)
          : DEFAULT_PORT_NAMES.map(port => <SettingsRow
            key={port}
            label={port}
            content={NOT_AVAILABLE} />)
        }
      </SettingsTable>
    </section>

    <UpdateSoftwareModal
      settings={settings}
      handleClose={() => setSoftwareUpdateVersion(null)}
      availableVersion={softwareUpdateVersion}
      updateVersion={updateVersion} />

    <hr />
    <hr />

    {/* <SettingsFormInput
      label='Access for HoloPort support (SSH)'
      name='sshAccess'
      type='checkbox'
      checked={sshAccessVal}
      onChange={handleToggleSshAccess} /> */}

    <Button name='factory-reset' variant='danger' wide styleName='factory-reset-btn' onClick={() => push('/factory-reset')}>Factory Reset</Button>
  </PrimaryLayout>
}

export function SettingsTable ({ updateAvailable, header, children }) {
  return <table styleName='settings-table' data-testid='settings-table'>
    <thead>
      <tr key='heading'>
        <th id={header.toLowerCase().trim()} styleName='settings-row-header'>
          <h5 styleName='row-header-title'>{header}</h5>
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
  return <tr styleName='settings-row' data-testid='settings-row'>
    <td styleName='settings-col align-left'>
      <h3 styleName='row-label' data-testid='settings-label'>{label}</h3>
    </td>
    <td styleName='settings-col align-right'>
      { updateAvailable && versionTable
        ? <SoftwareUpdateButton availableVersion={content} showSoftwareUpdateModal={showSoftwareUpdateModal} />
        : versionTable
          ? <h3 styleName='row-content'>Your Software is up-to-date</h3>
          : <h3 styleName='row-content'>{content}</h3>
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

export default props => <Settings {...props} />
