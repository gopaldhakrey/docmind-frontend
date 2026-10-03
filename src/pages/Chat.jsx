import { useEffect, useRef, useState } from "react";
import {
  Send,
  Square,
  FileText,
  RotateCcw,
  MessageSquare,
  Pencil,
  Trash2,
} from "lucide-react";

import { getMyDocuments } from "../api/documentApi";
import { askQuestion, streamQuestion } from "../api/chatApi";
import {
  getConversations,
  getConversationMessages,
  renameConversation,
  deleteConversation,
} from "../api/conversationApi";

import ChatMessage from "../components/ChatMessage";

const suggestions = [
  "Summarize the key points",
  "What are the main conclusions?",
  "Find the most important dates",
  "Explain this document simply",
];

export default function Chat() {
  const [docs, setDocs] = useState([]);
  const [selected, setSelected] = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [streaming, setStreaming] = useState(true);

  const [conversationId, setConversationId] = useState("");
  const [conversations, setConversations] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activeConversation, setActiveConversation] = useState(null);

  const [editingConversation, setEditingConversation] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  const bottom = useRef(null);

  async function loadConversations() {
    try {
      setHistoryLoading(true);

      const { data } = await getConversations();

      setConversations(data?.data ?? data ?? []);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setHistoryLoading(false);
    }
  }

  async function openConversation(conversation) {
    try {
      setHistoryLoading(true);

      const { data } = await getConversationMessages(conversation.id);

      const loadedMessages = (Array.isArray(data) ? data : []).map(
        (message) => ({
          id: message.id,
          role: message.messageType === "USER" ? "user" : "assistant",
          content: message.content,
          citations: message.citations || [],
        })
      );

      setMessages(loadedMessages);
      setConversationId(conversation.id);
      setActiveConversation(conversation.id);
      setQuestion("");
    } catch (error) {
      console.error("Failed to load conversation:", error);
    } finally {
      setHistoryLoading(false);
    }
  }

  async function handleRenameConversation(id) {
    const title = editingTitle.trim();

    if (!title) return;

    try {
      const { data } = await renameConversation(id, title);

      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === id
            ? { ...conversation, ...data }
            : conversation
        )
      );

      setEditingConversation(null);
      setEditingTitle("");
    } catch (error) {
      console.error("Failed to rename conversation:", error);
    }
  }

  async function handleDeleteConversation(id) {
    try {
      await deleteConversation(id);

      setConversations((current) =>
        current.filter((conversation) => conversation.id !== id)
      );

      if (activeConversation === id) {
        reset();
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  }

  useEffect(() => {
    getMyDocuments()
      .then(({ data }) => setDocs(data?.data ?? data ?? []))
      .catch((error) => console.error("Failed to load documents:", error));

    loadConversations();
  }, []);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function reset() {
    setMessages([]);
    setConversationId("");
    setQuestion("");
    setActiveConversation(null);
  }

  async function send() {
    const q = question.trim();

    if (!q || busy) return;

    setQuestion("");
    setMessages((m) => [...m, { role: "user", content: q }]);
    setBusy(true);

    const payload = {
      question: q,
      documentId: selected || null,
      topK: 5,
      minSimilarity: 0.0,
      conversationId: conversationId || null,
    };

    if (streaming) {
      const id = crypto.randomUUID();

      setMessages((m) => [
        ...m,
        {
          id,
          role: "assistant",
          content: "",
          citations: [],
        },
      ]);

      try {
        await streamQuestion(payload, (chunk) => {
          if (chunk.startsWith("{")) {
            try {
              const parsed = JSON.parse(chunk);

              if (parsed.conversationId) {
                setConversationId(parsed.conversationId);
                setActiveConversation(parsed.conversationId);
              }

              if (parsed.answer) {
                setMessages((m) =>
                  m.map((x) =>
                    x.id === id
                      ? {
                          ...x,
                          content: x.content + parsed.answer,
                          citations:
                            parsed.citations || x.citations,
                        }
                      : x
                  )
                );
              }

              return;
            } catch {
              // Not JSON; treat it as normal streamed text.
            }
          }

          setMessages((m) =>
            m.map((x) =>
              x.id === id
                ? { ...x, content: x.content + chunk }
                : x
            )
          );
        });

        await loadConversations();
      } catch (error) {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content: `Sorry, I couldn't complete that request. ${error.message}`,
            citations: [],
          },
        ]);
      }
    } else {
      try {
        const { data } = await askQuestion(payload);
        const result = data?.data ?? data;

        setConversationId(result.conversationId || "");
        setActiveConversation(result.conversationId || null);

        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content: result.answer || "",
            citations: result.citations || [],
          },
        ]);

        await loadConversations();
      } catch (error) {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content:
              error.response?.data?.message ||
              "Something went wrong.",
            citations: [],
          },
        ]);
      }
    }

    setBusy(false);
  }

  return (
    <div className="chat-page">
      <div className="chat-head">
        <div>
          <p className="eyebrow">RAG ASSISTANT</p>
          <h1>Ask your documents.</h1>
          <p>
            Answers are generated from retrieved passages in your
            library.
          </p>
        </div>

        <div className="chat-actions">
          <label className="toggle">
            <input
              type="checkbox"
              checked={streaming}
              onChange={(e) => setStreaming(e.target.checked)}
            />
            <span>Streaming</span>
          </label>

          <button className="button subtle" onClick={reset}>
            <RotateCcw size={15} />
            New
          </button>
        </div>
      </div>

      <div className="chat-layout">
        <aside className="chat-sidebar">
          <button
            type="button"
            className="new-conversation-btn"
            onClick={reset}
          >
            <span className="new-conversation-icon">+</span>
            <span>New conversation</span>
          </button>

          <div className="history-section">
            <div className="history-header">
              <span className="sidebar-section-title">
                Conversations
              </span>

              <span className="conversation-count">
                {conversations.length}
              </span>
            </div>

            <div className="conversation-list">
              {historyLoading && conversations.length === 0 ? (
                <div className="history-empty">
                  Loading...
                </div>
              ) : conversations.length === 0 ? (
                <div className="history-empty">
                  No conversations yet
                </div>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`conversation-item ${
                      activeConversation === conversation.id
                        ? "active"
                        : ""
                    }`}
                  >
                    {editingConversation === conversation.id ? (
                      <input
                        autoFocus
                        className="conversation-edit-input"
                        value={editingTitle}
                        onChange={(e) =>
                          setEditingTitle(e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleRenameConversation(
                              conversation.id
                            );
                          }

                          if (e.key === "Escape") {
                            setEditingConversation(null);
                            setEditingTitle("");
                          }
                        }}
                      />
                    ) : (
                      <>
                        <button
                          type="button"
                          className="conversation-main"
                          onClick={() =>
                            openConversation(conversation)
                          }
                        >
                          <MessageSquare size={16} />

                          <span className="conversation-title">
                            {conversation.title ||
                              "Untitled conversation"}
                          </span>
                        </button>

                        <div className="conversation-actions">
                          <button
                            type="button"
                            className="conversation-action"
                            title="Rename"
                            onClick={(e) => {
                              e.stopPropagation();

                              setEditingConversation(
                                conversation.id
                              );

                              setEditingTitle(
                                conversation.title || ""
                              );
                            }}
                          >
                            <Pencil size={14} />
                          </button>

                          <button
                            type="button"
                            className="conversation-action delete"
                            title="Delete"
                            onClick={(e) => {
                              e.stopPropagation();

                              handleDeleteConversation(
                                conversation.id
                              );
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="sidebar-bottom">
            <div className="document-scope">
              <span className="sidebar-section-title">
                Document scope
              </span>

              <select
                value={selected}
                onChange={(e) =>
                  setSelected(e.target.value)
                }
              >
                <option value="">All documents</option>

                {docs.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.fileName || d.filename || d.id}
                  </option>
                ))}
              </select>

              <div className="scope-note">
                <FileText size={16} />
                <span>
                  {selected
                    ? "Questions will use the selected PDF."
                    : "Questions can search your whole library."}
                </span>
              </div>
            </div>
          </div>
        </aside>

        <section className="chat-card">
          <div className="messages">
            {!messages.length && (
              <div className="chat-empty">
                <div className="empty-mark">D</div>
                <h2>What would you like to know?</h2>
                <p>
                  Ask a question about the documents you've
                  uploaded.
                </p>

                <div className="suggestions">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => setQuestion(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <ChatMessage
                key={m.id || i}
                message={m}
              />
            ))}

            <div ref={bottom} />
          </div>

          <div className="composer">
            <textarea
              value={question}
              onChange={(e) =>
                setQuestion(e.target.value)
              }
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey
                ) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Ask something about your documents…"
              rows={1}
            />

            <button
              className="send-btn"
              onClick={send}
              disabled={busy || !question.trim()}
            >
              {busy ? (
                <Square size={17} />
              ) : (
                <Send size={17} />
              )}
            </button>
          </div>

          <small className="composer-hint">
            Enter to send · Shift + Enter for a new line
          </small>
        </section>
      </div>
    </div>
  );
}
