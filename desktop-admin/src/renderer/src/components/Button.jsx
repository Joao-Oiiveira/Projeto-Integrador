// components/Button.jsx — Botão estilizado (identidade visual EduAcess Web)
import React from 'react'

const Button = ({ text, onClick, type = 'button', variant = 'primary', className = '', disabled = false, children }) => {
  const variants = {
    primary: `
      bg-gray-900 text-white font-medium py-2.5 px-6 rounded-2xl shadow-md
      border border-gray-800 transition-all duration-300 ease-in-out
      hover:bg-gray-800 hover:shadow-lg hover:border-purple-500
      active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-900 disabled:hover:border-gray-800 disabled:hover:shadow-md disabled:active:scale-100
    `,
    danger: `
      bg-red-600 text-white font-medium py-2.5 px-6 rounded-2xl shadow-sm shadow-red-200
      transition-all duration-300 ease-in-out
      hover:bg-red-700 active:scale-95
      focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
    `,
    secondary: `
      bg-gray-100 text-gray-700 font-medium py-2.5 px-6 rounded-2xl
      transition-all duration-300 ease-in-out
      hover:bg-gray-200 active:scale-95
      focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
    `,
    ghost: `
      bg-transparent text-gray-500 font-medium py-2.5 px-6 rounded-2xl
      transition-all duration-300 ease-in-out
      hover:bg-gray-100 hover:text-gray-900 active:scale-95
      focus:outline-none
      disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
    `
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${variants[variant] || variants.primary} ${className}`}
    >
      {children || text}
    </button>
  )
}

export default Button
