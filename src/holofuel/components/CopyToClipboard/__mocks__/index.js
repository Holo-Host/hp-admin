import React from 'react'

// this get's called with children, copyContent and messageText as props
export default jest.fn(({ children }) => <div>{children}</div>)
