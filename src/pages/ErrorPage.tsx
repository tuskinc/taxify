import React from 'react'

interface ErrorPageProps {
  message?: string
}

const ErrorPage: React.FC<ErrorPageProps> = ({ message }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="max-w-md w-full bg-white shadow rounded p-6 text-center">
        <h1 className="text-xl font-semibold text-red-700">Something went wrong</h1>
        <p className="mt-2 text-gray-700">{message ?? 'Please try again later.'}</p>
      </div>
    </div>
  )
}

export default ErrorPage


