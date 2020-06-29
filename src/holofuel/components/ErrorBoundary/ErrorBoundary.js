import React, { Component, useEffect } from 'react'
import useErrorContext from 'holofuel/contexts/useErrorContext'

// SetErrorContext is a hack allowing us to use the new conext APIs with hooks 
function SetErrorContext ({ newError }) {
  const { setCurrentError } = useErrorContext()
  useEffect(() => {
    if (newError) {
      setCurrentError(newError)
    }
  }, [newError, setCurrentError])
  return <div />
}

export default class ErrorBoundary extends Component {
  constructor(props) {
      super(props)
      this.state = {
        hasError: false
      }
  }
  componentDidCatch(error, info) {
    console.log('ErrorBoundary componentDidCatch ERROR : ', error)
    console.log('ErrorBoundary componentDidCatch INFO : ', info)
    
    if (error) {
      this.setState({ newError: error })
    }
  }
  render() {
    if (this.state.newError) {
      return <>
        <SetErrorContext newError={this.state.newError} />
        {this.props.children}
      </>
    } else {
      return this.props.children
    }
  }
}