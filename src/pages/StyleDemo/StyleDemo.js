import React from 'react'
import './StyleDemo.module.css'

export default function StyleDemo () {
  return <div>
    <div styleName='colored-div'>
      This is colored using a global color.
    </div>
    <div styleName='local-compose'>
      This composes its border from a different style.
    </div>
    <div styleName='nonlocal-compose'>
      This composes its typography from the global typography file.
    </div>
  </div>
}
