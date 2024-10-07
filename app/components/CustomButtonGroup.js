import { useState } from "react";

const CustomButtonGroup = ({ options, handleSelection }) => {
  const [selectedOption, setSelectedOption] = useState("");

  const handleClick = (option) => {
    setSelectedOption(option);
    handleSelection(option);
  };

  return (
    <div className="grid grid-cols-2 gap-2 mt-3 ml-11">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => handleClick(option)}
          className={`px-4 py-3 rounded-md border border-[#8DC63F] text-left text-[#8DC63F] hover:bg-[#8DC63F] hover:text-white transition ${
            selectedOption === option ? "bg-[#8DC63F] text-white" : "text-[#8DC63F]"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default CustomButtonGroup;
