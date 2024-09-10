// ButtonGroup.tsx
import React from 'react';

type ButtonGroupProps = {
  messageContent: string;
  onButtonClick: (message: string) => void;
};

const ButtonGroup: React.FC<ButtonGroupProps> = ({
  messageContent,
  onButtonClick,
}) => {
  const options = ["Upload Document", "Specify", "Maybe Later"];

  return (
    <>
      {messageContent && (
        <div className="space-x-2 mt-4">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => onButtonClick(option)}
              className="px-2 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </>
  );
};

export default ButtonGroup;
