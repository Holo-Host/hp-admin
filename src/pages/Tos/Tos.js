import React from 'react'
import TosModal from 'components/TosModal'
import { string } from 'prop-types'

export default function Tos ({
  history: { push }
}) {
  const returnToSettings = () => push('/settings')

  return <TosModal handleClose={returnToSettings} isOpen />
}

Tos.propTypes = {
  tos: string
}
