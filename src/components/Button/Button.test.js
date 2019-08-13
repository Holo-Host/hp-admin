import React from 'react'
import { render } from '@testing-library/react'

import Button from './Button'

it('should rendered child text', () => {
  const childText = 'Child Text'
  const { queryByText } = render(
    <Button>{childText}</Button>
  )

  expect(queryByText(childText)).toBeInTheDocument()
})
