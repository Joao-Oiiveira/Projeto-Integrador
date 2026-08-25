// components/Input.jsx — Campo de Input estilizado (identidade visual EduAcess Web)
import React from 'react'

const Input = ({ label, id, type = 'text', placeholder, value, onChange, ...props }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...props}
        className="
          w-full 
          bg-gray-50
          text-gray-900
          rounded-2xl
          px-4 
          py-3 
          focus:outline-none 
          focus:ring-2 
          focus:ring-purple-500 
          border border-gray-200
          transition-all 
          placeholder-gray-400
        "
      />
    </div>
  )
}

export default Input
