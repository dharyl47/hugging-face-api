'use client';
import { useChat } from "ai/react";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  // Function to render messages with proper formatting
const renderMessages = () => {
  let renderedMessages: string[] = [];
  let currentUser: string | null = null;

  for (const m of messages) {
    if (currentUser === "user" && m.role === "user") {
      // Concatenate consecutive user messages
      renderedMessages[renderedMessages.length - 1] += m.content;
    } else if (currentUser === "assistant" && m.role === "assistant") {
      // Stop rendering once the assistant has responded
      break;
    } else {
      // Start a new message
     renderedMessages.push(
       `${m.role === "user" ? "User" : "Moneyversity"}: ${m.content.replace(
         /<\|endoftext\|>/g,
         ""
       )}`
     );
      currentUser = m.role === "user" ? "user" : "assistant";
    }
  }

  return renderedMessages.map((message, index) => (
    <div
      key={index}
      className={currentUser === "user" ? "text-blue-600" : "text-blue-600"}
    >
      {message}
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
          placeholder="Hi I'm Moneyversity AI Bot Support, ask me anything.."
          onChange={handleInputChange}
        />
        <button
          type="submit"
          className="w-full py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 mt-2"
        >
          Send
        </button>
      </form>
    </div>
  );
}
