import React, { useState } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { Link } from 'react-router-dom'
import PrimaryLayout from 'components/layout/PrimaryLayout'
import LocationIcon from 'components/icons/LocationIcon'
import PhoneIcon from 'components/icons/PhoneIcon'
import GridIcon from 'components/icons/GridIcon'
import ArrowRightIcon from 'components/icons/ArrowRightIcon'
import HostingReportQuery from 'graphql/HostingReportQuery.gql'
import EarningsReportQuery from 'graphql/EarningsReportQuery.gql'
import './Dashboard.module.css'

// Mock value to be replaced by graphql query
export const mockEarnings = 4984

export default function Dashboard ({ earnings = mockEarnings }) {
  const { data: { hostingReport = {} } = {} } = useQuery(HostingReportQuery)
  const { data: { earningsReport = {} } = {} } = useQuery(EarningsReportQuery)

  const hostedHapps = hostingReport.hostedHapps || []

  const [areHappsExpanded, setAreHappsExpanded] = useState(false)

  return <PrimaryLayout headerProps={{ title: 'HP Admin' }}>
    {<Card title='Hosting'>
      <div styleName='hosting-row'>
        <LocationIcon styleName='hosting-icon' /> {hostingReport.localSourceChains || '--'} Local source chains
      </div>
      <div styleName='hosting-row'>
        <PhoneIcon styleName='hosting-icon' /> {hostingReport.zomeCalls || '--'} Zome calls
      </div>
      <div styleName={areHappsExpanded ? 'hosting-row-expanded' : 'hosting-row'} onClick={() => setAreHappsExpanded(!areHappsExpanded)}>
        <GridIcon styleName='hosting-icon' /> {hostedHapps.length || '--'} Hosted hApps
        <ArrowRightIcon color='#979797' styleName={areHappsExpanded ? 'up-arrow' : 'down-arrow'} />
        {areHappsExpanded && <div styleName='happ-list'>
          {hostedHapps.map(({ name }) => <div styleName='happ-name'>{name}</div>)}
        </div>}
      </div>
    </Card>}

    {<Card title='Earnings'>
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
  </PrimaryLayout>
}

function Card ({ title, subtitle, linkTo, children }) {
  const Wrapper = linkTo
    ? ({ children }) => <MixedLink styleName='card' to={linkTo}>
      {children}
    </MixedLink>
    : ({ children }) => <div styleName='card'>
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
