import React, { useState, useContext } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { Link } from 'react-router-dom'
import { isNil } from 'lodash/fp'
import PrimaryLayout from 'components/layout/PrimaryLayout'
import LocationIcon from 'components/icons/LocationIcon'
import PhoneIcon from 'components/icons/PhoneIcon'
import GridIcon from 'components/icons/GridIcon'
import ScreenWidthContext from 'contexts/screenWidth'
import ArrowRightIcon from 'components/icons/ArrowRightIcon'
import HposSettingsQuery from 'graphql/HposSettingsQuery.gql'
import HostingReportQuery from 'graphql/HostingReportQuery.gql'
import EarningsReportQuery from 'graphql/EarningsReportQuery.gql'
import HolofuelLedgerQuery from 'graphql/HolofuelLedgerQuery.gql'
import { presentHolofuelAmount, POLLING_INTERVAL_GENERAL } from 'utils'
import './Dashboard.module.css'

export default function Dashboard () {
  // nb: we only call settings here to track hpos connection status (see apolloClient.js for use)
  useQuery(HposSettingsQuery)
  const { data: { hostingReport = {} } = {} } = useQuery(HostingReportQuery)
  const { data: { earningsReport = {} } = {} } = useQuery(EarningsReportQuery)
  const { data: { holofuelLedger: { balance } = { balance: '--' } } = {} } = useQuery(HolofuelLedgerQuery, { fetchPolicy: 'cache-and-network', pollInterval: POLLING_INTERVAL_GENERAL })
  const { localSourceChains } = hostingReport

  const hostedHapps = hostingReport.hostedHapps || []

  const [areHappsExpanded, setAreHappsExpanded] = useState(false)

  const isWide = useContext(ScreenWidthContext)

  return <PrimaryLayout headerProps={{ title: 'Home' }}>
    <div styleName={isWide ? 'dashboard-wide' : 'dashboard-narrow'}>
      <Card title='Hosting' isWide={isWide}>
        <div styleName='hosting-row'>
          <LocationIcon styleName='hosting-icon' /> {isNil(localSourceChains) ? '--' : localSourceChains} Local source chains
        </div>
        <div styleName='hosting-row'>
          <PhoneIcon styleName='hosting-icon' /> {hostingReport.zomeCalls || '--'} Zome calls
        </div>
        <div styleName={areHappsExpanded ? 'hosting-row-expanded' : 'hosting-row'} onClick={() => setAreHappsExpanded(!areHappsExpanded)}>
          <GridIcon styleName='hosting-icon' /> {hostedHapps.length} Hosted hApps
          {!!hostedHapps.length && <ArrowRightIcon color='#979797' styleName={areHappsExpanded ? 'up-arrow' : 'down-arrow'} />}
        </div>
        {areHappsExpanded && <div styleName='happ-list'>
          {hostedHapps.map(({ name }) => <div styleName='happ-name'>{name}</div>)}
        </div>}
      </Card>

      {/* hiding this until earnings are available */ false && <Card title='Earnings' isWide={isWide}>
        <div styleName='balance'>
          {(earningsReport.totalEarnings || '--').toLocaleString()} TF
        </div>
        <div styleName='pricing-section'>
          <div styleName='pricing-title'>Pricing</div>
          <div styleName='pricing-row'>
            <div styleName='pricing-type'>CPU</div>
            <div styleName='price'>{earningsReport.cpu} TF</div>
            <div styleName='pricing-unit'>per ms</div>
          </div>
          <div styleName='pricing-row'>
            <div styleName='pricing-type'>Bandwidth</div>
            <div styleName='price'>{earningsReport.bandwidth} TF</div>
            <div styleName='pricing-unit'>per MB</div>
          </div>
          <div styleName='pricing-row'>
            <div styleName='pricing-type'>Storage</div>
            <div styleName='price'>{earningsReport.storage} TF</div>
            <div styleName='pricing-unit'>per MB</div>
          </div>
        </div>
      </Card>}

      {<Card title='TestFuel' linkTo='/holofuel' isWide={isWide}>
        <div styleName='balance-label'>Balance</div>
        <div styleName='balance'>{presentHolofuelAmount(balance)} TF</div>
      </Card>}
    </div>
  </PrimaryLayout>
}

function Card ({ title, subtitle, linkTo, children, isWide }) {
  const Wrapper = linkTo
    ? ({ children }) => <MixedLink styleName={isWide ? 'card-wide' : 'card-narrow'} to={linkTo}>
      {children}
    </MixedLink>
    : ({ children }) => <div styleName={isWide ? 'card-wide' : 'card-narrow'}>
      {children}
    </div>

  return <Wrapper>
    <h1 styleName='card-title'>{title}</h1>
    {subtitle && <h3 styleName='card-subtitle'>{subtitle}</h3>}
    {children}
  </Wrapper>
}

// a react-router link that can also take an external url
function MixedLink ({ to, children, ...props }) {
  const isExternal = /^https?:\/\//.test(to) || /^http?:\/\//.test(to)
  if (isExternal) {
    return <a href={to} target='_blank' rel='noopener noreferrer' {...props}>
      {children}
    </a>
  } else {
    return <Link to={to} {...props}>
      {children}
    </Link>
  }
}
