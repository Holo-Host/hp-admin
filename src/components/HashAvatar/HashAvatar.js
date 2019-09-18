import React from 'react'
import { Network as Identicon } from 'react-identicon-variety-pack'

import './HashAvatar.module.css'

const HashAvatar = ({ avatarUrl, seed, size = 96, className }) => avatarUrl
  ? <img
    src={avatarUrl}
    alt='Avatar'
    styleName='image'
    className={className}
    style={{ width: size, height: size }}
  />
  : <Identicon seed={seed || 'default-seed'} className={className} size={size} circle />

export default HashAvatar
