import React, { createContext, useContext, useEffect, useState } from "react";
import { api, setSession, clearSession, getStoredUser, getToken } from "./api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser());
  const [checking, setChecking] = useState(!!getToken());

  useEffect(() => {
    if (!getToken()) {
      setChecking(false);
      return;
    }
    api
      .me()
      .then((u) => setUser(u))
      .catch(() => {
        clearSession();
        setUser(null);
      })
      .finally(() => setChecking(false));
  }, []);

  async function login(email, password) {
    const { token, user: u } = await api.login(email, password);
    setSession(token, u);
    setUser(u);
    return u;
  }

  async function logout() {
    await api.logout();
    clearSession();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, checking, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
