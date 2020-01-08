import React, { useContext, useState, useEffect, useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import { useQuery } from '@apollo/react-hooks'
import { isEmpty } from 'lodash/fp'
import { object } from 'prop-types'
import cx from 'classnames'
import HolofuelActionableTransactionsQuery from 'graphql/HolofuelActionableTransactionsQuery.gql'
import HolofuelUserQuery from 'graphql/HolofuelUserQuery.gql'
import HolofuelLedgerQuery from 'graphql/HolofuelLedgerQuery.gql'
import ScreenWidthContext from 'holofuel/contexts/screenWidth'
import SideMenu from 'holofuel/components/SideMenu'
import Header from 'holofuel/components/Header'
import FlashMessage from 'holofuel/components/FlashMessage'
import AlphaFlag from 'holofuel/components/AlphaFlag'
import { TYPE, STATUS } from 'models/Transaction'
import { INBOX_PATH } from 'holofuel/utils/urls'
import styles from './PrimaryLayout.module.css' // eslint-disable-line no-unused-vars
import 'holofuel/global-styles/colors.css'
import 'holofuel/global-styles/index.css'

export function PrimaryLayout ({
  children,
  headerProps = {},
  showAlphaFlag = true
}) {
  const { data: { holofuelActionableTransactions: actionableTransactions = [] } = {} } = useQuery(HolofuelActionableTransactionsQuery, { fetchPolicy: 'cache-and-network' })
  const { loading: holofuelUserLoading, data: { holofuelUser = {} } = {} } = useQuery(HolofuelUserQuery)
  const { loading: ledgerLoading, data: { holofuelLedger: { balance: holofuelBalance } = {} } = {} } = useQuery(HolofuelLedgerQuery, { fetchPolicy: 'cache-and-network' })

  const inboxCount = actionableTransactions.filter(actionableTx => actionableTx.status !== STATUS.canceled && !((actionableTx.status === STATUS.declined) && (actionableTx.type === TYPE.request))).length

  const isWide = useContext(ScreenWidthContext)
  const [isMenuOpen, setMenuOpen] = useState(false)
  const hamburgerClick = () => setMenuOpen(!isMenuOpen)
  const handleMenuClose = () => setMenuOpen(false)

  const history = useHistory()
  const goToInbox = () => history.push(INBOX_PATH)

  const filterActionableTransactionsByStatusAndType = useCallback((status, type) => actionableTransactions.filter(actionableTx => ((actionableTx.status === status) && (actionableTx.type === type))), [actionableTransactions])

  useEffect(() => {
    if (!isEmpty(filterActionableTransactionsByStatusAndType(STATUS.declined, TYPE.offer))) {
      goToInbox()
    }
  }, [filterActionableTransactionsByStatusAndType])

  // console.log('holofuelUser IN PRIMARY LAYOUT :', holofuelUser)
  const childrenWithProps = React.Children.map(children, child => {
    if (!isEmpty(child)) return React.cloneElement(child, { whoami: holofuelUser })
  })

  return <div styleName={cx('styles.primary-layout', { 'styles.wide': isWide }, { 'styles.narrow': !isWide })}>
    <Header {...headerProps} agent={holofuelUser} agentLoading={holofuelUserLoading} hamburgerClick={hamburgerClick} inboxCount={inboxCount} />
    <SideMenu
      isOpen={isMenuOpen}
      handleClose={handleMenuClose}
      agent={holofuelUser}
      agentLoading={holofuelUserLoading}
      inboxCount={inboxCount}
      holofuelBalance={holofuelBalance}
      ledgerLoading={ledgerLoading}
      isWide={isWide}
    />
    {showAlphaFlag && <AlphaFlag styleName='styles.alpha-flag' />}
    <div styleName='styles.content'>
      <FlashMessage />
      {childrenWithProps}
    </div>
  </div>
}

PrimaryLayout.propTypes = {
  headerProps: object
}

export default PrimaryLayout
