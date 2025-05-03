export default function ChatMessage({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex mb-4 ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`
          max-w-3/4 p-3 rounded-lg
          ${
            isUser
              ? "bg-blue-500 text-white rounded-br-none"
              : "bg-gray-100 text-gray-800 rounded-bl-none"
          }
        `}
      >
        <p className="text-sm">{message.content}</p>
      </div>
    </div>
  );
}
