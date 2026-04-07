import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function checkHealth() {
      try {
        setLoading(true)
        const response = await fetch('/api/v1/health')
        const data = await response.json()
        setHealth(data)
      } catch {
        setError('Failed to connect to backend. Make sure API is running on port 5000.')
      } finally {
        setLoading(false)
      }
    }

    checkHealth()
  }, [])

  return (
    <main style={{ maxWidth: 900, margin: '50px auto', padding: '0 16px' }}>
      <h1>Smart Waste Management</h1>
      <p>Backend foundation status</p>

      <section style={{ border: '1px solid #ddd', borderRadius: 10, padding: 16, marginTop: 20 }}>
        {loading && <p>Checking API health...</p>}

        {!loading && error && (
          <p style={{ color: 'crimson' }}>
            {error}
          </p>
        )}

        {!loading && health && (
          <div>
            <p><strong>Status:</strong> {health.status}</p>
            <p><strong>Message:</strong> {health.message}</p>
            <p><strong>Timestamp:</strong> {health.timestamp}</p>
            <p><strong>Endpoint:</strong> /api/v1/health</p>
          </div>
        )}
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Implemented in Phase 1</h2>
        <ul>
          <li>Express server with security middleware and error handling</li>
          <li>MongoDB connection layer</li>
          <li>Versioned routing (/api/v1)</li>
          <li>Auth route scaffolding with JWT middleware</li>
          <li>Core models for users, complaints, workers, notifications</li>
        </ul>
      </section>
    </main>
  )
}

export default App
