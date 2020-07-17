import { string } from 'prop-types'
import React from 'react'
import ReactTooltip from 'react-tooltip'
import './ToolTip.module.css'
import { caribbeanGreen } from 'utils/colors'

export default function ToolTip ({ toolTipText, children }) {
  return <>
    <span data-tip='' data-for='registerTip'>
      {children}
    </span>
    <ReactTooltip id='registerTip' place='top' effect='solid' backgroundColor={caribbeanGreen}>
      {toolTipText}
    </ReactTooltip>
  </>
}

ToolTip.propTypes = {
  toolTipText: string
}
