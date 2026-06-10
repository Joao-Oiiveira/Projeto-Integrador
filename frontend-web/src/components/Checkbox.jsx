import React from 'react';

const Checkbox = ({ id, label, description, checked, onChange }) => {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
      <div className="flex items-center h-6">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-purple-600 focus:ring-purple-500 focus:ring-offset-white dark:focus:ring-offset-gray-800 cursor-pointer"
        />
      </div>
      <div className="flex flex-col">
        <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-200 cursor-pointer">
          {label}
        </label>
        {description && (
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</span>
        )}
      </div>
    </div>
  );
};

export default Checkbox;