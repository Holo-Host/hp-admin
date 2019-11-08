import React, { useState } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { isEmpty, get } from 'lodash/fp'
import './Settings.module.css'
import { sliceHash as presentHash } from 'utils'
import HashAvatar from 'components/HashAvatar'
import Modal from 'components/Modal'
import PrimaryLayout from 'components/layout/PrimaryLayout'
import Button from 'components/Button'
import HposSettingsQuery from 'graphql/HposSettingsQuery.gql'
import HposStatusQuery from 'graphql/HposStatusQuery.gql'
import HposUpdateVersionMutation from 'graphql/HposUpdateVersionMutation.gql'

// Dictionary of all relevant display ports
export const getLabelFromPortName = portname => ({
  primaryPort: 'Primary Port'
}[portname])

const DEFAULT_PORT_NAMES = ['Device Admin', 'HC Network', 'Hosting']
const NOT_AVAILABLE = 'Not Available'

// Data - Mutation hook
function useUpdateVersion () {
  const [hposUpdateVersion] = useMutation(HposUpdateVersionMutation)
  return (availableVersion) => hposUpdateVersion({
    variables: { availableVersion }
  })
}

export function Settings ({ history: { push } }) {
  const { data: { hposSettings: settings = [] } = {} } = useQuery(HposSettingsQuery)
  const { data: { hposStatus: status = [] } = {} } = useQuery(HposStatusQuery)

  const [toggleModal, setToggleModal] = useState()
  const showModal = () => setToggleModal(true)

  const updateVersion = useUpdateVersion()

  const availableVersion = get('versionInfo.availableVersion', status)
  const currentVersion = get('versionInfo.currentVersion', status)
  const updateAvailable = (!isEmpty(availableVersion) && !isEmpty(currentVersion) && (availableVersion !== currentVersion))

  return <PrimaryLayout headerProps={{ title: 'HoloPort Settings' }}>
    <header styleName='jumbotron-header' data-testid='settings-header'>
      {!isEmpty(settings) && <>
        <HashAvatar seed={settings.hostPubKey} styleName='avatar-image' />
        <h2> {settings.hostName ? `${settings.hostName}'s` : 'Your'} HoloPort </h2>
      </> }
      {/* TODO: Find out what the below number should link to... */}
      <Button styleName='header-button'>{presentHash(settings.hostPubKey)}</Button>
    </header>

    <section styleName='settings-section'>
      <SettingsTable header='Software Version' updateAvailable={updateAvailable}>
        {!isEmpty(status) && !isEmpty(status.versionInfo)
          ? <SoftwareUpdateRow
            label={presentHash(currentVersion)}
            content={availableVersion}
            showModal={showModal}
            updateAvailable={updateAvailable} />
          : <SoftwareUpdateRow
            label='Version Number'
            content={NOT_AVAILABLE} />
        }
      </SettingsTable>

      <SettingsTable header='About this HoloPort' >
        <SettingsRow
          label='Device Name'
          dataTestId='device-name'
          content={!isEmpty(settings) && settings.deviceName ? settings.deviceName : NOT_AVAILABLE} />
        <SettingsRow
          label='Network ID'// change to 'Network'
          // TODO : Change content (below) to `settings.networkStatus`
          dataTestId='network-type'
          content={!isEmpty(status) && status.networkId ? presentHash(status.networkId, 14) : NOT_AVAILABLE} />
      </SettingsTable>

      <SettingsTable header='Access Port Numbers'>
        {!isEmpty(status) && !isEmpty(status.ports)
          ? Object.entries(status.ports).map(port => {
            if (port[0] === '__typename') return null
            return <SettingsRow
              key={port[0] + port[1]}
              label={getLabelFromPortName(port[0])}
              content={port[1]} />
          })
          : DEFAULT_PORT_NAMES.map(port => <SettingsRow
            key={port}
            label={port}
            content={NOT_AVAILABLE} />)
        }
      </SettingsTable>
    </section>

    <UpdateSoftwareModal
      settings={settings}
      handleClose={() => setToggleModal(null)}
      toggleModal={toggleModal}
      availableVersion={availableVersion}
      updateVersion={updateVersion} />

    <hr />
    <hr />

    <Button name='factory-reset' variant='danger' wide styleName='factory-reset-button' onClick={() => push('/factory-reset')}>Factory Reset</Button>
  </PrimaryLayout>
}

export function SettingsTable ({ updateAvailable, header, children }) {
  return <table styleName='settings-table' data-testid='settings-table'>
    <thead>
      <tr key='heading'>
        <th id={header.toLowerCase().trim()} styleName='settings-row-header'>
          <h5 styleName='row-header-title'>{header}
            { updateAvailable
              ? <span styleName='second-header'> Update Available</span>
              : null
            }
          </h5>
        </th>
      </tr>
    </thead>
    <tbody>
      {children}
    </tbody>
  </table>
}

export function SettingsRow ({ label, content, dataTestId }) {
  return <tr styleName='settings-row' data-testid='settings-row'>
    <td styleName='settings-col align-left'>
      <h3 styleName='row-label' data-testid='settings-label'>{label}</h3>
    </td>
    <td styleName='settings-col align-right'>
      <h3 styleName='row-content' data-testid={dataTestId}>{content}</h3>
    </td>
  </tr>
}

export function SoftwareUpdateRow ({ label, showModal, updateAvailable }) {
  return <tr styleName='settings-row' data-testid='settings-row'>
    <td styleName='settings-col align-left'>
      <h3 styleName='row-label' data-testid='settings-label'>{label}</h3>
    </td>
    <td styleName='settings-col align-right'>
      { updateAvailable
        ? <SoftwareUpdateButton showModal={showModal} />
        : <h3 styleName='row-content'>Your Software is up-to-date</h3>
      }
    </td>
  </tr>
}

function SoftwareUpdateButton ({ showModal }) {
  return <Button
    onClick={showModal}
    styleName='update-version-button'>
    Update Software
  </Button>
}

export function UpdateSoftwareModal ({ settings, handleClose, toggleModal, availableVersion, updateVersion }) {
  if (!availableVersion) return null
  const onYes = () => {
    updateVersion()
    handleClose()
  }
  return <Modal
    contentLabel={`Update ${settings.deviceName}?`}
    isOpen={!!toggleModal}
    handleClose={handleClose}
    styleName='modal'>
    <div styleName='modal-title'>Are you sure?</div>
    <div styleName='modal-text' role='heading' data-testid='modal-message'>
      Would you like to update the HoloPort, "{settings.deviceName}", to version {presentHash(availableVersion)}?
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

export default props => <Settings {...props} />
