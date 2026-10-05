import client from "./client";

export function getProfile() {
  return client.get("/profile");
}

export function uploadProfilePhoto(file) {
  const formData = new FormData();
  formData.append("file", file);

  return client.post("/profile/photo", formData);
}

export function removeProfilePhoto() {
  return client.delete("/profile/photo");
}
