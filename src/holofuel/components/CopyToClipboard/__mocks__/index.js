import React from 'react'

// The CopyToClipboard Component gets called with children, copyContent and messageText as props
export default jest.fn(({ children }) => <div>{children}</div>)
