const TOKEN_KEY = "sm_token";
const USER_KEY = "sm_user";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
}

export function setSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`/api${path}`, { ...options, headers });
  if (res.status === 401) {
    clearSession();
    throw new Error("unauthorized");
  }
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error((data && data.error) || `http-${res.status}`);
  return data;
}

export const api = {
  login: (email, password) =>
    request("/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  logout: () => request("/logout", { method: "POST" }).catch(() => {}),
  me: () => request("/me"),
  bootstrap: () => request("/bootstrap"),
  list: (collection) => request(`/${collection}`),
  create: (collection, row) =>
    request(`/${collection}`, { method: "POST", body: JSON.stringify(row) }),
  update: (collection, id, row) =>
    request(`/${collection}/${id}`, { method: "PUT", body: JSON.stringify(row) }),
  remove: (collection, id) => request(`/${collection}/${id}`, { method: "DELETE" }),
  importCollection: (collection, rows) =>
    request(`/${collection}`, { method: "PUT", body: JSON.stringify(rows) }),
  reset: () => request("/admin/reset", { method: "POST" }),
  exportAll: () => request("/admin/export"),
  importAll: (payload) =>
    request("/admin/import", { method: "POST", body: JSON.stringify(payload) }),
};
