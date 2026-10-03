import client from "./client";

export const getConversations = () => {
  return client.get("/conversations");
};

export const getConversationMessages = (conversationId) => {
  return client.get(`/conversations/${conversationId}/messages`);
};

export const renameConversation = (conversationId, title) => {
  return client.patch(`/conversations/${conversationId}`, {
    title,
  });
};

export const deleteConversation = (conversationId) => {
  return client.delete(`/conversations/${conversationId}`);
};
