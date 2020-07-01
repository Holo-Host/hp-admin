import React, { useEffect, useState, useRef } from 'react'
import { isEmpty } from 'lodash/fp'
import { useQuery } from '@apollo/react-hooks'
import { Link } from 'react-router-dom'
import PrimaryLayout from 'components/layout/PrimaryLayout'
import HashIcon from 'components/HashIcon'
import LaptopIcon from 'components/icons/LaptopIcon'
import PlusInDiscIcon from 'components/icons/PlusInDiscIcon'
import CopyAgentId from 'components/CopyAgentId'
import useConnectionContext from 'contexts/useConnectionContext'
import useFlashMessageContext from 'contexts/useFlashMessageContext'
import HposSettingsQuery from 'graphql/HposSettingsQuery.gql'
import HolofuelLedgerQuery from 'graphql/HolofuelLedgerQuery.gql'
import { presentHolofuelAmount } from 'utils'
import cx from 'classnames'
import './Dashboard.module.css'

// Mock value to be replaced by graphql query
export const mockEarnings = 4984

export default function Dashboard ({ earnings = mockEarnings }) {
  const { data: { hposSettings: settings = [] } = {} } = useQuery(HposSettingsQuery)
  const { data: { holofuelLedger: { balance } = { balance: 0 } } = {} } = useQuery(HolofuelLedgerQuery, { fetchPolicy: 'cache-and-network', pollInterval: 60000 })

  const { isConnected } = useConnectionContext()
  const { newMessage } = useFlashMessageContext()
  const [isFirstRenderComplete, setIsFirstRenderComplete] = useState(false)
  const isFirstAppRender = useRef(true)    

  useEffect(() => {
    if (isFirstRenderComplete && !isConnected.holochain) {
      newMessage('Your Holochain Conductor is currently unreachable.  \nAttempting to reconnect.', 0)
    } else if (isConnected.holochain) {
      setIsFirstRenderComplete(true)
      newMessage('', 0)
    }

    if (isFirstAppRender.current) {
      newMessage('Checking connection to your Holochain Conductor...', 0)
      isFirstAppRender.current = false
      setTimeout(() => setIsFirstRenderComplete(true), 5000)
    }
  }, [isConnected, newMessage, isFirstRenderComplete])

  // placeholder as we're not currently calling hha
  const noInstalledHapps = 0

  const isEarningsZero = Number(earnings) === 0
  const isBalanceZero = Number(balance) === 0

  const greeting = !isEmpty(settings.hostName) ? `Hi ${settings.hostName}!` : 'Hi!'

  return <PrimaryLayout headerProps={{ title: 'HP Admin' }}>
    <div styleName='avatar'>
      <CopyAgentId agent={{ id: settings.hostPubKey }} hpAdmin isMe>
        <HashIcon hash={settings.hostPubKey} size={42} />
      </CopyAgentId>
    </div>
    <h2 styleName='greeting'>{greeting}</h2>

    {false && <Card title='Hosting' linkTo='/admin/browse-happs' subtitle='Manage your Holo applications'>
      <div styleName='hosting-content' data-testid='hosted-apps'>
        {noInstalledHapps === 0 && <>
          <PlusInDiscIcon color='#06C470' />Host your first hApp!
        </>}
        {noInstalledHapps > 0 && <>
          <LaptopIcon styleName='laptop-icon' color='rgba(44, 63, 89, 0.80)' /> {noInstalledHapps} hApp{noInstalledHapps > 1 && 's'}
        </>}
      </div>
    </Card>}

    {false && <Card title='Earnings' linkTo='/admin/earnings' subtitle='Track your TestFuel earnings'>
      <div styleName={cx('balance', { 'empty-balance': isEarningsZero })}>
        <h4 styleName='balance-header'>
          {isEarningsZero ? 'Balance' : "Today's earnings"}
        </h4>
        <div styleName='balance-body' data-testid='hosted-earnings'>
          {isEarningsZero ? "You haven't earned TestFuel" : `${presentHolofuelAmount(earnings)} TF`}
        </div>
      </div>
    </Card>}

    <Card title='HoloFuel' linkTo='/holofuel/' subtitle='Send, and receive TestFuel'>
      <div styleName={cx('balance', { 'empty-balance': isBalanceZero })}>
        <h4 styleName='balance-header'>
          Current Balance
        </h4>
        <div styleName='balance-body' data-testid='holofuel-balance'>
          {isBalanceZero ? 'You have no TestFuel' : `${presentHolofuelAmount(balance)} TF`}
        </div>
      </div>
    </Card>

    {/* NB: Comment back in once community app is released. */}
    {/* <Card title='Community' linkTo={'/community/'} subtitle='Connect with your peers' /> */}
  </PrimaryLayout>
}

function Card ({ title, subtitle, linkTo, children }) {
  return <MixedLink styleName='card' to={linkTo}>
    <h1 styleName='card-title'>{title}</h1>
    <h3 styleName='card-subtitle'>{subtitle}</h3>
    {children}
  </MixedLink>
}

// a react-router link that can also take an external url
function MixedLink ({ to, children, ...props }) {
  const isExternal = /^https?:\/\//.test(to)
  if (isExternal) {
    return <a href={to} {...props}>
      {children}
    </a>
  } else {
    return <Link to={to} {...props}>
      {children}
    </Link>
  }
}
