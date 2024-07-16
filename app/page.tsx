'use client';
import { useChat } from "ai/react";
import { useEffect } from "react";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, setMessages } = useChat();

  useEffect(() => {
    // Initialize messages with a welcome message from the assistant
    setMessages([{
      id: Date.now().toString(), // Adding a unique id
      role: 'assistant',
      content: "Hi there! 😊 Welcome to Moneyversity's Estate Planning Chatbot. 🤖 I'm here to secure your future and that of your loved ones. Ready to get started?"
    }]);
  }, [setMessages]);

  const handleButtonClick = (message: string) => {
    setMessages([...messages, {
      id: Date.now().toString(),
      role: 'user',
      content: message
    }]);
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

  return (
    <div className="flex flex-col items-center justify-end min-h-screen bg-gray-100">
      <div
        className="bg-white w-full max-w-xl p-6 rounded-lg shadow-md overflow-y-auto mb-4"
        style={{ maxHeight: "calc(110vh - 220px)" }}
      >
        {renderMessages()}
      </div>

      <form className="w-full max-w-xl" onSubmit={handleSubmit}>
        <input
          className="w-full p-2 border border-gray-300 rounded shadow-md"
          value={input}
          placeholder="Hi, I'm Moneyversity AI Bot Support, ask me anything.."
          onChange={handleInputChange}
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
