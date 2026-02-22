import { UIMessage } from "ai";

export const ChatMessage = ({ message }: { message: UIMessage }) => {
  return (
    <div>
      {message.parts.map((part) =>
        part.type === "text" ? <p key={part.text}>{part.text}</p> : null,
      )}
    </div>
  );
};
