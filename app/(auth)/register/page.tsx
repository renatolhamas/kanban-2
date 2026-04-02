'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RegisterForm } from '@/components/RegisterForm'

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const handleRegister = async (email: string, name: string, password: string) => {
    try {
      setError(null)

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name, password }),
        credentials: 'include', // Send cookies
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      // Get redirect URL from response header
      const redirectTo = response.headers.get('X-Redirect-To') || '/settings/connection'

      // Redirect after successful registration
      setTimeout(() => {
        router.push(redirectTo)
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">
            Create Account
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Join Kanban to manage your boards
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <RegisterForm onSubmit={handleRegister} />
        </div>

        {/* Additional info */}
        <div className="mt-6 p-4 bg-white rounded-lg shadow text-center text-sm text-gray-600">
          <p>
            By registering, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:underline">
              Terms of Service
            </a>
            {' '}and{' '}
            <a href="#" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
