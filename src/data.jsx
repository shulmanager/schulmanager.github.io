import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "./api.js";
import { useAuth } from "./auth.jsx";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!user) {
      setData(null);
      return;
    }
    setLoading(true);
    try {
      const all = await api.bootstrap();
      setData(all);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    reload();
  }, [reload]);

  return (
    <DataContext.Provider value={{ data, loading, reload, setData }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}

export function useLookup() {
  const { data } = useData();
  const safe = data || {};
  const byId = (collection, id) =>
    (safe[collection] || []).find((r) => Number(r.id) === Number(id));

  return {
    subject: (id) => byId("subjects", id),
    classOf: (id) => byId("classes", id),
    teacher: (id) => byId("teachers", id),
    student: (id) => byId("students", id),
    userById: (id) => byId("users", id),
    collection: (name) => safe[name] || [],
  };
}
