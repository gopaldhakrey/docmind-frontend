import client from "./client";

export const uploadDocument = (file, onUploadProgress) => {
  const form = new FormData();
  form.append("file", file);
  return client.post("/documents/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });
};

export const uploadDocuments = (files, onUploadProgress) => {
  const form = new FormData();
  files.forEach((file) => form.append("files", file));
  return client.post("/documents/upload-multiple", form, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });
};

export const getMyDocuments = () => client.get("/documents/user");
export const getDocument = (id) => client.get(`/documents/${id}`);
export const deleteDocument = (id) => client.delete(`/documents/${id}`);
