import { render, act } from '@testing-library/react'
import wait from 'waait'

export async function renderAndWait (ui, ms = 0, options = {}) {
  let queries
  await act(async () => {
    queries = render(ui, options)
    await wait(ms)
  })
  return queries
}
