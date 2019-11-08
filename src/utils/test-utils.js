import { render, act } from '@testing-library/react'
import Modal from 'react-modal'
import wait from 'waait'

export async function renderAndWait (ui, ms = 0, options = {}) {
  let queries
  await act(async () => {
    queries = render(ui, options)
    await wait(ms)
  })
  return queries
}

export async function renderAndWaitWithModal (ui, ms = 0, options = {}) {
  let queries
  await act(async () => {
    queries = render(ui, options)
    await wait(ms)
    Modal.setAppElement(queries.container)
  })
  return queries
}
