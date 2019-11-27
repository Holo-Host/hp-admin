import React, { useState } from 'react'
import { isEmpty, get, keys, omit } from 'lodash/fp'
import './Settings.module.css'
import { sliceHash as presentHash, presentAgentId } from 'utils'
import HashIcon from 'components/HashIcon'
import CopyAgentId from 'components/CopyAgentId'
import Modal from 'components/Modal'
import PrimaryLayout from 'components/layout/PrimaryLayout'
import Button from 'components/UIButton'
import ToggleButton from 'components/ToggleButton'
import ArrowRightIcon from 'components/icons/ArrowRightIcon'
import HposSettingsQuery from 'graphql/HposSettingsQuery.gql'
import HposStatusQuery from 'graphql/HposStatusQuery.gql'
import HposUpdateVersionMutation from 'graphql/HposUpdateVersionMutation.gql'
import { useHPAuthQuery, useHPAuthMutation } from 'graphql/hpAuthHooks'
import { rhino } from 'utils/colors'

// Dictionary of all relevant display ports
export const getLabelFromPortName = portname => ({
  primaryPort: 'Primary Port'
}[portname])

// Data - Mutation hook
function useUpdateVersion () {
  const [hposUpdateVersion] = useHPAuthMutation(HposUpdateVersionMutation)
  return (availableVersion) => hposUpdateVersion({
    variables: { availableVersion }
  })
}

export function Settings ({ history: { push } }) {
  const { data: { hposSettings: settings = {} } = {} } = useHPAuthQuery(HposSettingsQuery)

  const { data: { hposStatus: status = {} } = {} } = useHPAuthQuery(HposStatusQuery)

  const [modalVisible, setModalVisible] = useState()
  const showModal = () => setModalVisible(true)

  const [sshAccess, setSshAccess] = useState()

  const updateVersion = useUpdateVersion()

  const availableVersion = get('versionInfo.availableVersion', status)
  const currentVersion = get('versionInfo.currentVersion', status)
  const updateAvailable = (!isEmpty(availableVersion) && !isEmpty(currentVersion) && (availableVersion !== currentVersion))

  const title = (settings.hostName ? `${settings.hostName}'s` : 'Your') + ' HoloPort'

  const ports = (() => {
    const portsObject = (omit('__typename', get('ports', status)) || {})
    const allKeys = keys(portsObject)
    return allKeys.map(key => ({
      label: getLabelFromPortName(key),
      value: portsObject[key]
    }))
  })()

  return <PrimaryLayout headerProps={{ title: 'HoloPort Settings' }}>
    <div styleName='avatar'>
      <CopyAgentId agent={{ id: settings.hostPubKey }} isMe>
        <HashIcon hash={settings.hostPubKey} size={42} />
      </CopyAgentId>
    </div>
    <div styleName='title'>{title}</div>

    <section styleName='settings-section'>
      <div styleName='version-header-row'>
        <div styleName='settings-header'>Software Version</div>
        {updateAvailable && <div styleName='update-available'>Update Available</div>}        
      </div>
      <SettingsRow
        label={presentAgentId(currentVersion)}
        value={updateAvailable ? <VersionUpdateButton showModal={showModal} /> : 'Your software is up to date.'}
        bottomStyle />
      <div styleName='settings-header'>About this HoloPort</div>
      <SettingsRow
        label='Device Name'
        dataTestId='device-name'
        value={!isEmpty(settings) && settings.deviceName ? settings.deviceName : 'Not Available'} />
      <SettingsRow
        label='Network ID'
        bottomStyle
        dataTestId='network-type'
        value={!isEmpty(status) && status.networkId ? presentHash(status.networkId, 14) : 'Not Available'} />
      <div styleName='settings-header'>Access Port Numbers</div>
      {ports.map(({ label, value }, i) => <SettingsRow
        key={label}
        label={label}
        value={value}
        bottomStyle={i === ports.length - 1} />)}
      <div styleName='settings-header'>&nbsp;</div>
      <SettingsRow
        label='SSH'
        value={<ToggleButton checked={sshAccess} onChange={e => setSshAccess(e.target.checked)} />} />
      <SettingsRow
        label={<Button name='factory-reset' variant='danger' wide styleName='factory-reset-button' onClick={() => push('/factory-reset')}>Factory Reset</Button>}
        value={<div onClick={() => push('/factory-reset')} styleName='arrow-wrapper'><ArrowRightIcon color={rhino} opacity={0.8} /></div>}
        bottomStyle />
    </section>

    <VersionUpdateModal
      settings={settings}
      handleClose={() => setModalVisible(null)}
      modalVisible={modalVisible}
      availableVersion={availableVersion}
      updateVersion={updateVersion} />
  </PrimaryLayout>
}

export function SettingsRow ({ label, value, dataTestId, bottomStyle }) {    
  return <div styleName={bottomStyle ? 'settings-row-bottom' : 'settings-row'} data-testid={dataTestId}>
    {typeof label === 'string'
      ? <span styleName='settings-label'>{label}</span>
      : label}
    {typeof value === 'string'
      ? <span styleName='settings-value'>{value}</span>
      : value}
  </div>
}

function VersionUpdateButton ({ showModal }) {
  return <Button
    variant='white'
    onClick={showModal}
    styleName='version-update-button'>
    Update Software
  </Button>
}

export function VersionUpdateModal ({ settings, handleClose, modalVisible, availableVersion, updateVersion }) {
  if (!availableVersion) return null
  const onYes = () => {
    updateVersion()
    handleClose()
  }
  return <Modal
    contentLabel={`Update ${settings.deviceName}?`}
    isOpen={!!modalVisible}
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
