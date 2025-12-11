// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Banners from "./pages/Banners";
import CategoriesPage from "./pages/CategoriesPage"; // ← NEW
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import ProductsPage from "./pages/ProductsPage";
import ServicesPage from "./pages/ServicesPage";
import ServiceCategoriesPage from "./pages/ServiceCategory";
import CustomersPage from "./pages/CustomersPage";
import CustomerCategoriesPage from "./pages/CustomerCategoriesPage";
import PartnersPage from "./pages/PartnersPage";
import ContactMessagesPage from "./pages/ContactMessagesPage";
import PostsPage from "./pages/PostsPage";
import PostCategoriesPage from "./pages/PostCategoriesPage";
import PostCreatePage from "./pages/PostCreatePage";
import PostEditPage from "./pages/PostEditPage";
import JobsPage from "./pages/JobsPage";
import JobCreatePage from "./pages/JobCreatePage";
import SettingsPage from "./pages/SettingsPage";

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
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="service-categories" element={<ServiceCategoriesPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route
          path="customer-categories"
          element={<CustomerCategoriesPage />}
        />
        <Route path="partners" element={<PartnersPage />} />
        <Route path="contact-messages" element={<ContactMessagesPage />} />
        {/* Posts */}
        <Route path="posts" element={<PostsPage />} />
        <Route path="posts/create" element={<PostCreatePage />} />
        <Route path="posts/:id/edit" element={<PostEditPage />} />
        <Route path="post-categories" element={<PostCategoriesPage />} />
        {/* Jobs (relative paths) */}
        <Route path="jobs" element={<JobsPage />} />
        <Route path="jobs/create" element={<JobCreatePage />} />
        <Route path="settings" element={<SettingsPage />} />
        {/* Optional: fallback */}
        <Route path="*" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}

export default App;
