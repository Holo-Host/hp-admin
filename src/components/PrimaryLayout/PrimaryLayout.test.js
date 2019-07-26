import React from 'react'
import ReactDOM from 'react-dom'
import PrimaryLayout from './PrimaryLayout'

it('renders without crashing', () => {
  const div = document.createElement('div')
  ReactDOM.render(<PrimaryLayout />, div)
  ReactDOM.unmountComponentAtNode(div)
})
