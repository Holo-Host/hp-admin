import React from 'react'
import { render } from '@testing-library/react'

import Button from './Button'

it('should render child text', () => {
  const childText = 'Child Text'
  const { getByText } = render(
    <Button>{childText}</Button>
  )

  expect(getByText(childText)).toBeInTheDocument()
})

it('should pass disabled attribute to underlying button element', () => {
  const childText = 'Child Text'
  const { getByText } = render(
    <Button disabled>{childText}</Button>
  )

  expect(getByText(childText)).toHaveAttribute('disabled')
})
