import { useState } from 'react';

const Slider = () => {
  const [value, setValue] = useState(500);

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  const getBackgroundStyle = () => {
    const percentage = (value / 1000) * 100;
    return {
      background: `linear-gradient(to right, #8dc63f ${percentage}%, #D1D5DB ${percentage}%)`
    };
  };

  return (
    <div className="relative mb-6">
      <input
        id="labels-range-input"
        type="range"
        value={value}
        min="0"
        max="1000"
        className="w-full h-2 rounded-lg appearance-none cursor-pointer"
        style={getBackgroundStyle()}
        onChange={handleChange}
      />
      <span className="text-sm text-gray-500 dark:text-white absolute left-0 -bottom-6 text-lg">Low Risk</span>
      <span className="text-sm text-gray-500 dark:text-white absolute left-1/2 transform -translate-x-1/2 -bottom-6 text-lg">Medium Risk</span>
      <span className="text-sm text-gray-500 dark:text-white absolute right-0 -bottom-6 text-lg">High Risk</span>
    </div>
  );
};

export default Slider;
