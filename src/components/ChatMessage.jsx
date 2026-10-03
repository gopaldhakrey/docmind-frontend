import ReactMarkdown from "react-markdown";
import CitationList from "./CitationList";

export default function ChatMessage({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`message ${isUser ? "user-message" : "assistant-message"}`}>
      <div className="message-label">{isUser ? "You" : "DocMind"}</div>
      <div className="message-body">
        {isUser ? <p>{message.content}</p> : <ReactMarkdown>{message.content || "…"}</ReactMarkdown>}
      </div>
      {!isUser && <CitationList citations={message.citations} />}
    </div>
  );
}
