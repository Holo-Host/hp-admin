import React from 'react'
import HashIcon from 'components/HashIcon'
import './HashAvatar.module.css'

const HashAvatar = ({ avatarUrl, seed, size = 96, className }) => avatarUrl
  ? <img
    src={avatarUrl}
    alt='Avatar'
    styleName='image'
    className={className}
    style={{ width: size, height: size }}
  />
  : <HashIcon
    hash={seed}
    size={size}
    className={className} />

export default HashAvatar
