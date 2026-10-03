import client from "./client";

export const askQuestion = (payload) => client.post("/chat/query", payload);

export const similaritySearch = (payload) =>
  client.post("/chat/search/similarity", payload);

export async function streamQuestion(payload, onChunk) {
  const token = localStorage.getItem("docmind_token");
  const response = await fetch(`${client.defaults.baseURL}/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Chat request failed (${response.status})`);
  }
  if (!response.body) throw new Error("Streaming is not supported by this browser.");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const events = buffer.split(/\r?\n\r?\n/);
    buffer = events.pop() ?? "";

    for (const event of events) {
      const lines = event.split(/\r?\n/);
      const data = lines
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.slice(5).trimStart())
        .join("\n");

      if (data) {
        if (data === "[DONE]") return;
        onChunk(data);
      } else if (event.trim()) {
        const raw = event.trim();
        if (raw !== "[DONE]") onChunk(raw);
      }
    }
  }

  if (buffer.trim() && buffer.trim() !== "[DONE]") {
    const raw = buffer.trim();
    if (raw.startsWith("data:")) onChunk(raw.slice(5).trimStart());
    else onChunk(raw);
  }
}
