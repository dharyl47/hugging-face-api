import React from 'react';

const CustomInput = ({ id, placeholder, className, value, onChange }) => {
  return (
    <input
      id={id}
      type="text"
      placeholder={placeholder}
      className={`w-full px-3 py-2 ${className}`}
      value={value}
      onChange={onChange}
    />
  );
};

export default CustomInput; 