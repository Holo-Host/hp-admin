import React, { useState } from 'react'
import { isEmpty, get } from 'lodash/fp'
import { useQuery, useMutation } from '@apollo/react-hooks'
import './Settings.module.css'
import { sliceHash as presentHash, presentAgentId } from 'utils'
import HashIcon from 'components/HashIcon'
import CopyAgentId from 'components/CopyAgentId'
import PrimaryLayout from 'components/layout/PrimaryLayout'
import Button from 'components/UIButton'
import ArrowRightIcon from 'components/icons/ArrowRightIcon'
import HposSettingsQuery from 'graphql/HposSettingsQuery.gql'
import HposStatusQuery from 'graphql/HposStatusQuery.gql'
import HposUpdateVersionMutation from 'graphql/HposUpdateVersionMutation.gql'
import HposUpdateSettingsMutation from 'graphql/HposUpdateSettingsMutation.gql'
import useFlashMessageContext from 'contexts/useFlashMessageContext'
import { rhino } from 'utils/colors'

// Dictionary of all relevant display ports
export const getLabelFromPortName = portname => ({
  primaryPort: 'Primary Port'
}[portname])

// Data - Mutation hook
function useUpdateVersion () {
  const [hposUpdateVersion] = useMutation(HposUpdateVersionMutation)
  return (availableVersion) => hposUpdateVersion({
    variables: { availableVersion }
  })
}

export function Settings ({ history: { push } }) {
  const { data: { hposSettings: settings = {} } = {} } = useQuery(HposSettingsQuery)

  const { data: { hposStatus: status = {} } = {} } = useQuery(HposStatusQuery)

  const [updateSettings] = useMutation(HposUpdateSettingsMutation)

  const [editedDeviceName, setEditedDeviceName] = useState('')
  const [isEditingDeviceName, setIsEditingDeviceName] = useState(false)

  const editDeviceName = () => {
    setEditedDeviceName(settings.deviceName)
    setIsEditingDeviceName(true)
  }

  const saveDeviceName = () => {
    updateSettings({
      variables: {
        ...settings,
        deviceName: editedDeviceName
      }
    })
    setEditedDeviceName('')
    setIsEditingDeviceName(false)
  }

  const cancelDeviceName = () => {
    setEditedDeviceName('')
    setIsEditingDeviceName(false)
  }

  const updateVersion = useUpdateVersion()
  const { newMessage } = useFlashMessageContext()
  const updateVersionWithMessage = () => {
    updateVersion()
    newMessage('Your software version has been updated.', 5000)
  }

  const availableVersion = get('versionInfo.availableVersion', status)
  const currentVersion = get('versionInfo.currentVersion', status)
  const updateAvailable = (!isEmpty(availableVersion) && !isEmpty(currentVersion) && (availableVersion !== currentVersion))

  const title = (settings.hostName ? `${settings.hostName}'s` : 'Your') + ' HoloPort'

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
        value={updateAvailable ? <VersionUpdateButton updateVersion={updateVersionWithMessage} /> : 'Your software is up to date.'}
        bottomStyle />
      <div styleName='settings-header'>About this HoloPort</div>
      {!isEditingDeviceName && <SettingsRow
        label='Device Name'
        dataTestId='device-name'
        onClick={editDeviceName}
        value={!isEmpty(settings) && settings.deviceName
          ? <div styleName='device-name-button'>
            <span styleName='settings-value'>{settings.deviceName}</span>
            <div styleName='arrow-wrapper'>
              <ArrowRightIcon color={rhino} opacity={0.8} />
            </div>
          </div>
          : 'Not Available'} />}
      {isEditingDeviceName && <div>
        <SettingsRow
          label='Device Name'
          dataTestId='device-name'
          bottomStyle
          value={<input
            styleName='device-name-input'
            value={editedDeviceName}
            onChange={e => setEditedDeviceName(e.target.value)} />} />
        <div styleName='device-edit-buttons'>
          <Button onClick={cancelDeviceName} variant='red-on-white' styleName='device-edit-button'>Cancel</Button>
          <Button onClick={saveDeviceName} variant='white' styleName='device-edit-button'>Save</Button>
        </div>
      </div>}
      <SettingsRow
        label='Network'
        bottomStyle
        dataTestId='network-type'
        value={!isEmpty(status) && status.networkId ? presentHash(status.networkId, 14) : 'Not Available'} />
      <div styleName='settings-header'>&nbsp;</div>
      <SettingsRow
        label={<a href='https://holo.host/holoport-reset' target='_blank' rel='noopener noreferrer' styleName='reset-link'>
          <Button name='factory-reset' variant='danger' wide styleName='factory-reset-button'>Factory Reset</Button>
        </a>}
        value={
          <div styleName='arrow-wrapper'>
            <a href='https://holo.host/holoport-reset' target='_blank' rel='noopener noreferrer' styleName='reset-link'>
              <ArrowRightIcon color={rhino} opacity={0.8} />
            </a>
          </div>}
        bottomStyle />
    </section>
  </PrimaryLayout>
}

export function SettingsRow ({ label, value, dataTestId, bottomStyle, onClick }) {
  return <div onClick={onClick} styleName={bottomStyle ? 'settings-row-bottom' : 'settings-row'} data-testid={dataTestId}>
    {typeof label === 'string'
      ? <span styleName='settings-label'>{label}</span>
      : label}
    {typeof value === 'string'
      ? <span styleName='settings-value'>{value}</span>
      : value}
  </div>
}

function VersionUpdateButton ({ updateVersion }) {
  return <Button
    variant='white'
    onClick={updateVersion}
    styleName='version-update-button'>
    Update Software
  </Button>
}

export default props => <Settings {...props} />
