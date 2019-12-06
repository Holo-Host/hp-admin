import React from 'react'
import PrimaryLayout from 'holofuel/components/layout/PrimaryLayout'
import TosModal from 'holofuel/components/TosModal'
import { HOME_PATH } from 'holofuel/utils/urls'

export default function Tos ({
  history: { push }
}) {
  const returnToHome = () => push(HOME_PATH)

  return <PrimaryLayout>
    <TosModal handleClose={returnToHome} isOpen />
  </PrimaryLayout>
}
