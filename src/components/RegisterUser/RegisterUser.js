import { useEffect } from 'react'
// import React, { useEffect } from 'react'
import { get } from 'lodash/fp'

export function RegisterUser (props) {
  const { children, registerHostingUser, hostingUser } = props

  const isRegistered = get('isRegistered', hostingUser)

  useEffect(() => {
    if (!hostingUser) return
    if (isRegistered) return
    registerHostingUser()
  })

  return children

  // TODO: Figure out why removing cache value, makes hostingUser and isReg Calls FAIL !!
  // if (hostingUser && isRegistered) {
  //   return children
  // } else {
  //   return <h1>Registering User</h1>
  // }
}

export default RegisterUser
