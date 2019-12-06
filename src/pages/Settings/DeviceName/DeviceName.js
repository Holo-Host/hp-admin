import React from 'react'
import { isEmpty, get, keys, omit } from 'lodash/fp'
import './DeviceName.module.css'
import { sliceHash as presentHash, presentAgentId } from 'utils'
import HashIcon from 'components/HashIcon'
import CopyAgentId from 'components/CopyAgentId'
import PrimaryLayout from 'components/layout/PrimaryLayout'
import Button from 'components/UIButton'
import ToggleButton from 'components/ToggleButton'
import ArrowRightIcon from 'components/icons/ArrowRightIcon'
import HposSettingsQuery from 'graphql/HposSettingsQuery.gql'
import HposStatusQuery from 'graphql/HposStatusQuery.gql'
import HposUpdateVersionMutation from 'graphql/HposUpdateVersionMutation.gql'
import { useHPAuthQuery, useHPAuthMutation } from 'graphql/hpAuthHooks'
import useFlashMessageContext from 'contexts/useFlashMessageContext'
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
        value={updateAvailable ? <VersionUpdateButton updateVersion={updateVersionWithMessage} /> : 'Your software is up to date.'}
        bottomStyle />
      <div styleName='settings-header'>About this HoloPort</div>
      <SettingsRow
        label='Device Name'
        dataTestId='device-name'
        onClick={() => push('/settings/device-name')}
        value={!isEmpty(settings) && settings.deviceName
          ? <div styleName='device-name-button'>
            <span styleName='settings-value'>{settings.deviceName}</span>
            <div styleName='arrow-wrapper'>
              <ArrowRightIcon color={rhino} opacity={0.8} />
            </div>
          </div>
          : 'Not Available'} />
      <SettingsRow
        label='Network'
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
