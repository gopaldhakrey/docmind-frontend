import { createContext, useContext, useEffect, useState } from "react";
import { login as loginApi, register as registerApi } from "../api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("docmind_user")) || null; }
    catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onStorage = () => {
      try { setUser(JSON.parse(localStorage.getItem("docmind_user")) || null); }
      catch { setUser(null); }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  async function login(usernameOrEmail, password) {
    setLoading(true);
    try {
      const { data } = await loginApi(usernameOrEmail, password);
      const body = data?.data ?? data;
      const token = body?.accessToken;
      const nextUser = body?.user;
      if (!token) throw new Error("Login succeeded but no access token was returned.");
      localStorage.setItem("docmind_token", token);
      localStorage.setItem("docmind_user", JSON.stringify(nextUser));
      setUser(nextUser);
      return body;
    } finally {
      setLoading(false);
    }
  }

  async function register(username, email, password) {
    const { data } = await registerApi(username, email, password);
    return data?.data ?? data;
  }

  function logout() {
    localStorage.removeItem("docmind_token");
    localStorage.removeItem("docmind_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
