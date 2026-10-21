import React from 'react';

/**
 * Button Component
 * Suporta estado de carregamento (isLoading), desabilitação (disabled),
 * spinner animado, customização de texto durante o loading e prevenção de cliques duplos.
 */
const Button = ({
  text,
  children,
  onClick,
  type = "button",
  className = "",
  disabled = false,
  isLoading = false,
  loadingText,
  ...props
}) => {
  const isDisabled = disabled || isLoading;

  const handleClick = (e) => {
    if (isDisabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (onClick) {
      onClick(e);
    }
  };

  const content = children || text;
  const displayLabel = isLoading && loadingText ? loadingText : content;

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={isDisabled}
      aria-busy={isLoading}
      aria-disabled={isDisabled}
      className={`
        inline-flex items-center justify-center gap-2
        bg-gray-900 dark:bg-gray-700
        text-white 
        font-medium 
        py-2.5 
        px-6 
        rounded-lg 
        shadow-md dark:shadow-none
        border border-gray-800 dark:border-gray-600
        transition-all 
        duration-300 
        ease-in-out 
        focus:outline-none 
        focus:ring-2 
        focus:ring-purple-500 
        focus:ring-offset-2 
        focus:ring-offset-white dark:focus:ring-offset-gray-900
        ${
          isDisabled
            ? 'opacity-60 cursor-not-allowed pointer-events-none shadow-none transform-none'
            : 'hover:bg-gray-800 dark:hover:bg-gray-600 hover:shadow-lg hover:border-purple-500 dark:hover:border-purple-400 active:scale-95'
        }
        ${className}
      `}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      )}
      <span>{displayLabel}</span>
    </button>
  );
};

export default Button;