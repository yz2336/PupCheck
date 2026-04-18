import type { ChatMessageDTO } from "@/types";

export default function ChatMessage({ message }: { message: ChatMessageDTO }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
          isUser
            ? "rounded-br-sm bg-brand text-white"
            : "rounded-bl-sm border border-black/5 bg-white text-gray-800"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}
