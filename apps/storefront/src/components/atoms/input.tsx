import React from 'react'

interface InputProps {
  type?: 'text' | 'email' | 'password' | 'search'
  placeholder?: string
  value: string
  onChange: (value: string) => void
  className?: string
  id?: string
  name?: string
}

export const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  className = '',
  id,
  name
}) => {
  return (
    <input
      type={type}
      id={id}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
    />
  )
}