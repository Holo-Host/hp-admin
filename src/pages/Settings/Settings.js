import React, { useState, useEffect, useContext } from 'react'
import { isEmpty, get, pick, isNil } from 'lodash/fp'
import { useQuery, useMutation } from '@apollo/react-hooks'
import './Settings.module.css'
import { sliceHash as presentHash, presentAgentId } from 'utils'
import HashIcon from 'components/HashIcon'
import PrimaryLayout from 'components/layout/PrimaryLayout'
import Button from 'components/UIButton'
import ArrowRightIcon from 'components/icons/ArrowRightIcon'
import HposSettingsQuery from 'graphql/HposSettingsQuery.gql'
import HposStatusQuery from 'graphql/HposStatusQuery.gql'
import HposUpdateSettingsMutation from 'graphql/HposUpdateSettingsMutation.gql'
import ScreenWidthContext from 'contexts/screenWidth'
import Input from 'components/Input'
import { rhino } from 'utils/colors'

// Dictionary of all relevant display ports
export const getLabelFromPortName = portname => ({
  primaryPort: 'Primary Port'
}[portname])

export function Settings () {
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
        ...pick(['hostPubKey', 'hostName', 'sshAccess'], settings),
        deviceName: editedDeviceName
      },
      refetchQueries: [{
        query: HposSettingsQuery
      }]

    })
    setIsEditingDeviceName(false)
  }

  const cancelDeviceName = () => {
    setEditedDeviceName('')
    setIsEditingDeviceName(false)
  }

  const currentVersion = get('versionInfo.currentVersion', status)

  const title = (settings.hostName ? `${settings.hostName}'s` : 'Your') + ' HoloPort'

  const [sshAccess, setSshAccess] = useState(false)

  useEffect(() => {
    if (!isNil(settings.sshAccess)) {
      setSshAccess(settings.sshAccess)
    }
  }, [setSshAccess, settings.sshAccess])

  const saveSshAccess = sshAccess => {
    updateSettings({
      variables: {
        ...pick(['hostPubKey', 'hostName', 'deviceName'], settings),
        sshAccess
      },
      refetchQueries: [{
        query: HposSettingsQuery
      }]

    })
  }

  const toggleSshAccess = (e) => {
    e.preventDefault()
    setSshAccess(e.target.checked)
    saveSshAccess(e.target.checked)
  }

  const isWide = useContext(ScreenWidthContext)

  return <PrimaryLayout headerProps={{ title: 'Settings', showBackButton: true }}>
    <div styleName='avatar'>
      <HashIcon hash={settings.hostPubKey} size={42} />
    </div>
    <div styleName='title'>{title}</div>

    <section styleName={isWide ? 'settings-section-wide' : 'settings-section-narrow'}>
      <SettingsRow
        label='HPOS Version'
        value={presentAgentId(currentVersion)}
        bottomStyle
      />
      <div styleName='settings-header'>About this HoloPort</div>
      {!isEditingDeviceName && <SettingsRow
        label='Device Name'
        dataTestId='device-name'
        onClick={editDeviceName}
        value={!isEmpty(settings) && settings.deviceName
          ? <div styleName='device-name-button'>
            <span styleName='settings-value'>{editedDeviceName || settings.deviceName}</span>
            <div styleName='arrow-wrapper'>
              <ArrowRightIcon color={rhino} opacity={0.8} />
            </div>
          </div>
          : 'Not Available'}
      />}
      {isEditingDeviceName && <div>
        <SettingsRow
          label='Device Name'
          dataTestId='device-name'
          bottomStyle
          value={<input
            styleName='device-name-input'
            value={editedDeviceName}
            onChange={e => setEditedDeviceName(e.target.value)}
          />}
        />
        <div styleName='device-edit-buttons'>
          <Button onClick={cancelDeviceName} variant='red-on-white' styleName='device-edit-button'>Cancel</Button>
          <Button onClick={saveDeviceName} variant='white' styleName='device-edit-button'>Save</Button>
        </div>
      </div>}
      <SettingsRow
        label='Network'
        bottomStyle
        dataTestId='network-type'
        value={!isEmpty(status) && status.networkId ? presentHash(status.networkId, 14) : 'Not Available'}
      />
      <div styleName='settings-header'>&nbsp;</div>

      <SettingsFormInput
        label='Access for HoloPort support (SSH)'
        name='sshAccess'
        type='checkbox'
        checked={sshAccess}
        onChange={toggleSshAccess} />

      <SettingsRow
        label={<a href='https://holo.host/holoport-reset' target='_blank' rel='noopener noreferrer' styleName='reset-link'>
          <Button name='factory-reset' variant='danger' wide styleName='factory-reset-button'>Factory Reset</Button>
        </a>}
        value={
          <div styleName='arrow-wrapper'>
            <a href='https://holo.host/holoport-reset' target='_blank' rel='noopener noreferrer' styleName='reset-link'>
              <ArrowRightIcon color={rhino} opacity={0.8} />
            </a>
          </div>
        }
        bottomStyle
      />
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

export function SettingsFormInput ({
  name,
  label,
  type = 'number',
  register,
  errors = {},
  ...inputProps
}) {
  return <div styleName='settings-row'>
    {label && <label styleName='settings-label' htmlFor={name}>{label}</label>}
    <Input name={name} id={name} type={type} placeholder={label} ref={register} {...inputProps} />
    {errors[name] && <small styleName='field-error'>{errors[name].message}</small>}
  </div>
}

export default props => <Settings {...props} />
