import React from 'react';

const Button = ({ text, onClick, type = "button", className = "" }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`
        bg-gray-900 
        text-white 
        font-medium 
        py-2.5 
        px-6 
        rounded-lg 
        shadow-md 
        border border-gray-800
        transition-all 
        duration-300 
        ease-in-out 
        hover:bg-gray-800 
        hover:shadow-lg 
        hover:border-purple-500
        active:scale-95
        focus:outline-none 
        focus:ring-2 
        focus:ring-purple-500 
        focus:ring-offset-2 
        focus:ring-offset-gray-900
        ${className}
      `}
    >
      {text}
    </button>
  );
};

export default Button;