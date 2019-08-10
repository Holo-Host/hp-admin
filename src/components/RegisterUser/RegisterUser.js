import React, { useEffect } from 'react'

export function RegisterUser (props) {
  const { children, registerHostingUser, loading } = props

  useEffect(() => {
    registerHostingUser()
  })

  if (loading) {
    return <h1>
      REGISTERING HOSTING USER
    </h1>
  } else {
    return children
  }
}

export default RegisterUser
