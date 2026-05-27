// components/Checkbox.jsx
import React from 'react';

const Checkbox = ({ id, label, description, checked, onChange }) => {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-gray-800 bg-gray-900/50 hover:bg-gray-800 transition-colors cursor-pointer">
      <div className="flex items-center h-6">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="w-5 h-5 rounded border-gray-700 bg-gray-800 text-purple-500 focus:ring-purple-500 focus:ring-offset-gray-900 cursor-pointer"
        />
      </div>
      <div className="flex flex-col">
        <label htmlFor={id} className="text-sm font-medium text-white cursor-pointer">
          {label}
        </label>
        {description && (
          <span className="text-xs text-gray-400 mt-0.5">{description}</span>
        )}
      </div>
    </div>
  );
};

export default Checkbox;