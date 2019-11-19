import { render, act } from '@testing-library/react'
import Modal from 'react-modal'
import wait from 'waait'

// *************************************************************************
// Helper Functions :
export async function renderAndWait (ui, ms = 0, options = {}) {
  let queries
  await act(async () => {
    queries = render(ui, options)
    await wait(ms)
  })
  return queries
}

// *************************************************************************
// Shared Functions :
export function setupModal (renderQueries) {
  Modal.setAppElement(renderQueries.container)
  return renderQueries
}
