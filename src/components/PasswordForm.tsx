'use client'

import React, { useState } from 'react'

export default function PasswordForm({
  className = '',
  lang = 'default',
}: {
  className?: string
  lang?: string
}) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      window.location.reload()
    } else {
      setError("Falsches Passwort. Versuch's nochmal.")
    }
  }

  return (
    <html className={className} lang={lang}>
      <head>
        <title>Passwortschutz</title>
      </head>
      <body>
        <form
          className="flex min-h-screen items-center justify-center bg-gray-900 font-sans text-white"
          onSubmit={handleSubmit}
        >
          <div className="rounded bg-gray-800 p-6 shadow-md">
            <h1 className="mb-4 text-lg font-bold">Passwort erforderlich</h1>
            <input
              className="mb-2 w-full rounded px-3 py-2 text-black"
              onChange={e => setPassword(e.target.value)}
              placeholder="Passwort"
              type="password"
              value={password}
            />
            {error && <p className="mb-2 text-sm text-red-500">{error}</p>}
            <button
              className="w-full rounded bg-blue-600 px-4 py-2 font-bold hover:bg-blue-700"
              type="submit"
            >
              Einloggen
            </button>
          </div>
        </form>
      </body>
    </html>
  )
}
