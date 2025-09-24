import React from 'react';

const ItemsPerPageSelector = ({ 
  value, 
  onChange, 
  options = [5, 10, 20, 50, 100],
  label = 'Items per page'
}) => {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
        {label}:
      </span>
      <select
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ItemsPerPageSelector;