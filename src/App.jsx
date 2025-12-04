// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Banners from "./pages/Banners";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

function App() {
  return (
    <Routes>
      {/* Login */}
      <Route path="/login" element={<Login />} />

      {/* All protected routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* ← Use RELATIVE paths (no leading slash) */}
        <Route index element={<Dashboard />} /> {/* Default route */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="banners" element={<Banners />} />
        {/* Add more pages */}
        {/* <Route path="products" element={<Products />} /> */}
        {/* Optional: fallback */}
        <Route path="*" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}

export default App;
