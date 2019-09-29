import React, { useContext, useState } from 'react'
import { useQuery } from '@apollo/react-hooks'
import { object } from 'prop-types'
import cx from 'classnames'
import HolofuelActionableTransactionsQuery from 'graphql/HolofuelActionableTransactionsQuery.gql'
import HolofuelUserQuery from 'graphql/HolofuelUserQuery.gql'
import HolofuelLedgerQuery from 'graphql/HolofuelLedgerQuery.gql'
import ScreenWidthContext from 'contexts/screenWidth'
import SideMenu from 'holofuel/components/SideMenu'
import { presentAgentId } from 'utils'
import styles from './PrimaryLayout.module.css' // eslint-disable-line no-unused-vars
import 'holofuel/global-styles/colors.css'
import 'holofuel/global-styles/index.css'

import Header from 'holofuel/components/Header'

export function PrimaryLayout ({
  children,
  headerProps = {}
}) {
  const { data: { holofuelActionableTransactions: transactions = [] } = {} } = useQuery(HolofuelActionableTransactionsQuery)
  const { loading: holofuelUserLoading, data: { holofuelUser = {} } = {} } = useQuery(HolofuelUserQuery)
  const { data: { holofuelLedger: { balance: holofuelBalance } = { balance: 0 } } = {} } = useQuery(HolofuelLedgerQuery)

  const inboxCount = transactions.length

  let agent = {}
  let agentLoading
  if (holofuelUserLoading) agentLoading = true
  else agent = { ...holofuelUser, id: presentAgentId(holofuelUser.id) }

  const isWide = useContext(ScreenWidthContext)
  const [isMenuOpen, setMenuOpen] = useState(false)
  const hamburgerClick = () => setMenuOpen(!isMenuOpen)
  const handleMenuClose = () => setMenuOpen(false)

  return <div styleName={cx('styles.primary-layout', { 'styles.wide': isWide }, { 'styles.narrow': !isWide })}>
    <Header {...headerProps} agent={agent} agentLoading={agentLoading} hamburgerClick={hamburgerClick} />
    <SideMenu
      isOpen={isMenuOpen}
      handleClose={handleMenuClose}
      agent={agent}
      agentLoading={agentLoading}
      inboxCount={inboxCount}
      holofuelBalance={holofuelBalance}
    />
    <div styleName='styles.content'>
      {children}
    </div>
  </div>
}

PrimaryLayout.propTypes = {
  headerProps: object
}

export default PrimaryLayout
