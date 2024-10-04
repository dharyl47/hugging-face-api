import { useState } from "react";

const SelectableButtonGroup = ({ options, handleSelection }) => {
  const [selectedOption, setSelectedOption] = useState("");

  const handleClick = (option) => {
    setSelectedOption(option);
    handleSelection(option);
  };

  return (
    <div className="space-x-2">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => handleClick(option)}
          className={`px-2 py-2 rounded-md border border-[#8DC63F] mb-1 ${
            selectedOption === option ? "bg-[#8DC63F] text-white" : "text-[#8DC63F]"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default SelectableButtonGroup;
