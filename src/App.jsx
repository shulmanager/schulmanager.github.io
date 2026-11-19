import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./auth.jsx";
import Layout from "./components/Layout.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Messages from "./pages/Messages.jsx";
import Calendar from "./pages/Calendar.jsx";
import Exams from "./pages/Exams.jsx";
import Schedule from "./pages/Schedule.jsx";
import Classbook from "./pages/Classbook.jsx";
import Detention from "./pages/Detention.jsx";
import Invoices from "./pages/Invoices.jsx";
import Letters from "./pages/Letters.jsx";
import Account from "./pages/Account.jsx";
import Admin from "./pages/Admin.jsx";

function Protected({ children }) {
  const { user, checking } = useAuth();
  const location = useLocation();
  if (checking) return <div className="empty">Lade…</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

export default function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route
        path="/*"
        element={
          <Protected>
            <Layout>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/modules/messenger/messages" element={<Messages />} />
                <Route path="/modules/calendar/overview" element={<Calendar />} />
                <Route path="/modules/exams/view" element={<Exams />} />
                <Route path="/modules/schedules/view" element={<Schedule />} />
                <Route path="/modules/classbook/reports" element={<Classbook />} />
                <Route path="/modules/classbook/homework" element={<Classbook homework />} />
                <Route path="/modules/detention/enrollments" element={<Detention />} />
                <Route path="/modules/invoicing/students-invoices" element={<Invoices />} />
                <Route path="/modules/letters/view" element={<Letters />} />
                <Route path="/account" element={<Account />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Layout>
          </Protected>
        }
      />
    </Routes>
  );
}
