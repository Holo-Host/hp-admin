import React from 'react'
import './HappThumbnail.module.css'

const HappThumbnail = ({ title, url, className }) => (
  <img src={url} styleName='image' className={className} alt={`${title} icon`} />
)

export default HappThumbnail
