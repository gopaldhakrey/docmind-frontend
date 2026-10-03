import client from "./client";

export const login = (usernameOrEmail, password) =>
  client.post("/auth/login", { username: usernameOrEmail, password });

export const register = (username, email, password) =>
  client.post("/auth/register", { username, email, password });
