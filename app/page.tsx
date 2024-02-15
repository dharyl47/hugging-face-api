'use client';
import { useChat } from "ai/react";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div className="flex flex-col items-center justify-end min-h-screen bg-gray-100">
      <div
        className="bg-white w-full max-w-xl p-6 rounded-lg shadow-md overflow-y-auto mb-4"
        style={{ maxHeight: "calc(110vh - 220px)" }}
      >
        {messages.map((m) => (
          <div
            key={m.id}
            className={`${
              m.role === "user" ? "text-blue-600" : "text-green-600"
            } mb-2`}
          >
            {m.role === "user" ? "User: " : "Moneyversity: "}
            {m.content}
          </div>
        ))}
      </div>

      <form className="w-full max-w-xl" onSubmit={handleSubmit}>
        <input
          className="w-full p-2 border border-gray-300 rounded shadow-md"
          value={input}
          placeholder="Hi I'm Moneyversity AI Bot, ask me anything.."
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