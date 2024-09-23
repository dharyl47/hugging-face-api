import { useState } from 'react';

const BusinessImportanceSlider = ({ onProceed }) => {
  const [value, setValue] = useState(1); // Start from 1 for "Not Important"
  const [selectedImportance, setSelectedImportance] = useState("Not Important");

  const handleChange = (event) => {
    const newValue = parseInt(event.target.value, 10);
    setValue(newValue);

    // Dynamically update the importance level without calling the main function
    if (newValue === 1) {
      setSelectedImportance("Not Important");
    } else if (newValue === 2) {
      setSelectedImportance("Average Importance");
    } else {
      setSelectedImportance("Very Important");
    }
  };

  const getBackgroundStyle = () => {
    const percentage = ((value - 1) / 2) * 100; // Since we have 3 levels (1 to 3)
    return {
      background: `linear-gradient(to right, #8dc63f ${percentage}%, #D1D5DB ${percentage}%)`
    };
  };

  const handleProceedClick = () => {
    // Trigger the passed function with the selected importance when Proceed is clicked
    onProceed(selectedImportance);
  };

  return (
    <div>
      <div className="relative mb-6">
        <input
          id="importance-range-input"
          type="range"
          value={value}
          min="1"
          max="3"
          className="w-full h-2 rounded-lg appearance-none cursor-pointer"
          style={getBackgroundStyle()}
          onChange={handleChange}
        />
        <span className="text-sm text-white absolute left-0 -bottom-6 text-lg">Not Important</span>
        <span className="text-sm text-white absolute left-1/2 transform -translate-x-1/2 -bottom-6 text-lg">Average Importance</span>
        <span className="text-sm text-white absolute right-0 -bottom-6 text-lg">Very Important</span>
      </div>

      {/* Proceed button */}
      <button
        onClick={handleProceedClick}
        className="mt-4 px-4 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F] hover:bg-[#8DC63F] hover:text-white transition"
      >
        Proceed
      </button>

      <style jsx>{`
        input[type='range'] {
          -webkit-appearance: none;
          appearance: none;
        }
        
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background-color: white;
          border-radius: 50%;
          border: none;
        }

        input[type='range']::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background-color: white;
          border-radius: 50%;
          border: none;
        }

        input[type='range']::-ms-thumb {
          width: 20px;
          height: 20px;
          background-color: white;
          border-radius: 50%;
          border: none;
        }

        /* Additional style to remove the blue highlight for Firefox */
        input[type='range']::-moz-focus-outer {
          border: 0;
        }
        
        /* Additional support for IE */
        input[type='range']::-ms-track {
          background: transparent;
          border-color: transparent;
          color: transparent;
        }
      `}</style>
    </div>
  );
};

export default BusinessImportanceSlider;
