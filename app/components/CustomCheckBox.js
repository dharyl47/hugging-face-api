import React from 'react';

const CustomCheckBox = ({ id, name, className, value, checked, onChange }) => {
  return (
    <input
      type="checkbox"
      id={id}
      name={name}
      value={value}
      checked={checked}
      onChange={onChange}
      className={`${className} ${checked ? 'bg-[#8DC63F]' : 'bg-white'} border border-[#8DC63F] focus:ring-0 focus:ring-offset-0`}
    />
  );
};

export default CustomCheckBox;