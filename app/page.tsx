'use client';
import { useChat } from "ai/react";
import { useEffect, useState } from "react";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, setMessages } = useChat();
  const [inputValue, setInputValue] = useState(input);
  const [submitOnNextUpdate, setSubmitOnNextUpdate] = useState(false);

  useEffect(() => {
    // Initialize messages with a welcome message from the assistant
    setMessages([{
      id: Date.now().toString(), // Adding a unique id
      role: 'assistant',
      content: "Hi there! 😊 Welcome to Moneyversity's Estate Planning Chatbot. 🤖 I'm here to secure your future and that of your loved ones. Ready to get started?"
    }]);
  }, [setMessages]);

  useEffect(() => {
    if (submitOnNextUpdate) {
      const formEvent = { preventDefault: () => {} };
      handleSubmit(formEvent as React.FormEvent<HTMLFormElement>);
      setSubmitOnNextUpdate(false); // Reset submit flag
    }
  }, [submitOnNextUpdate, handleSubmit]);

  const handleButtonClick = (message: string) => {
    setInputValue(message); // Update the input value immediately
    const syntheticEvent = {
      target: { value: message }
    };
    handleInputChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
    setSubmitOnNextUpdate(true); // Set flag to submit form on next update
  };

  // Function to render messages with proper formatting
  const renderMessages = () => {
    return messages.map((message, index) => (
      <div key={message.id} className={message.role === "user" ? "text-blue-600" : "text-blue-600"}>
        {message.role === "assistant" && index === 0 ? (
          <>
            <div>{`Moneyversity: ${message.content.replace(/<\|endoftext\|>/g, "")}`}</div>
            <div className="flex space-x-2 mt-2">
              <button
                onClick={() => handleButtonClick("Absolutely")}
                className="px-4 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
              >
                Absolutely
              </button>
              <button
                onClick={() => handleButtonClick("Tell me more")}
                className="px-4 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
              >
                Tell me more
              </button>
              <button
                onClick={() => handleButtonClick("Not now")}
                className="px-4 py-2 rounded-md border border-[#8DC63F] text-[#8DC63F]"
              >
                Not now
              </button>
            </div>
          </>
        ) : (
          <div>{`${message.role === "user" ? "User" : "Moneyversity"}: ${message.content.replace(/<\|endoftext\|>/g, "")}`}</div>
        )}
      </div>
    ));
  };

  const handleInputChangeWrapper = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange(e);
    setInputValue(e.target.value);
  };

  return (
    <div className="flex flex-col items-center justify-end min-h-screen bg-gray-100">
      <div
        className="bg-white w-full max-w-xl p-6 rounded-lg shadow-md overflow-y-auto mb-4"
        style={{ maxHeight: "calc(110vh - 220px)" }}
      >
        {renderMessages()}
      </div>

      <form
        className="w-full max-w-xl"
        onSubmit={(e) => {
          e.preventDefault(); // Prevent default form submission
          handleSubmit(e); // Call handleSubmit directly
        }}
      >
        <input
          className="w-full p-2 border border-gray-300 rounded shadow-md"
          value={inputValue}
          placeholder="Hi, I'm Moneyversity AI Bot Support, ask me anything.."
          onChange={handleInputChangeWrapper}
        />
        <button
          type="submit"
          className="w-full py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 mt-2"
        >
          Send
        </button>
        <p className="text-gray-500 text-sm mt-2">
          AI model: meta-llama/Llama-2-70b-chat-hf
        </p>
      </form>
    </div>
  );
}
