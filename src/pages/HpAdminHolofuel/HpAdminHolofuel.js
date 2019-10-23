import React from 'react'
import PrimaryLayout from 'components/layout/PrimaryLayout'

export default function HpAdminHolofuel ({ history: { push } }) {
  return <PrimaryLayout
    headerProps={{
      title: 'HoloPort'
    }}
  >
    <div>
      <h1>HP Admin HoloFuel Page</h1>
    </div>
  </PrimaryLayout>
}
