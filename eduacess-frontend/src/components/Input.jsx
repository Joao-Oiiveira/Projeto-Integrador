import React from 'react';

// Adicionamos value e onChange nas propriedades recebidas
const Input = ({ label, id, type = "text", placeholder, value, onChange }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange} // Aciona a mudança de estado
        className="
          w-full 
          bg-gray-800 
          text-white 
          rounded-lg 
          px-4 
          py-3 
          focus:outline-none 
          focus:ring-2 
          focus:ring-purple-500 
          border border-transparent 
          transition-all 
          placeholder-gray-500
        "
      />
    </div>
  );
};

export default Input;