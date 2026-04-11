import { createMemoryHistory, createRouter } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { handler } from '../dist/server/index.js'

export default async function api(req, res) {
  try {
    // Forward all requests to the TanStack Start handler
    await handler(req, res)
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
