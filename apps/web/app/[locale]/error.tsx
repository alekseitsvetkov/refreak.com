'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          fontSize: '2.25rem',
          fontWeight: 'bold',
          color: '#111827',
          margin: 0
        }}>500</h1>
        <p style={{
          marginTop: '0.5rem',
          fontSize: '1.125rem',
          color: '#4b5563',
          margin: '0.5rem 0 0 0'
        }}>
          Something went wrong!
        </p>
        <button
          onClick={reset}
          style={{
            marginTop: '1rem',
            borderRadius: '0.375rem',
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '0.5rem 1rem',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#1d4ed8'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#2563eb'
          }}
        >
          Try again
        </button>
      </div>
    </div>
  )
}
