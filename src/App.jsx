// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Banners from "./pages/Banners";
import ProductCategory from "./pages/ProductCategory"; 
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Product from "./pages/Product";
import Solution from "./pages/Solution";
import SolutionCategory from "./pages/SolutionCategory";
import CustomersPage from "./pages/CustomersPage";
import CustomerCategoriesPage from "./pages/CustomerCategoriesPage";
import PartnersPage from "./pages/PartnersPage";
import ContactMessagesPage from "./pages/ContactMessagesPage";
import PostsPage from "./pages/PostsPage";
import PostCategoriesPage from "./pages/PostCategoriesPage";
import PostCreatePage from "./pages/PostCreatePage";
import PostEditPage from "./pages/PostEditPage";
import SettingsPage from "./pages/SettingsPage";
import Job from "./pages/Job";
import JobCreate from "./pages/JobCreate";
import JobEdit from "./pages/JobEdit";
import Candidate from "./pages/candidate/Candidate";
import AdminAboutUs from "./pages/AdminAboutUs";
import AdminWidget from "./pages/AdminWidget";
import AdminSupportPage from "./pages/AdminSupportPage";
import AdminLocationPage from "./pages/AdminLocationPage";
import Industry from "./pages/Industry";
import JoinUs from "./pages/JoinUs";

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
        <Route path="product-category" element={<ProductCategory />} />
        <Route path="products" element={<Product />} />
        <Route path="industry" element={<Industry />} />
        <Route path="joinus" element={<JoinUs />} />
        <Route path="solutions" element={<Solution />} />
        <Route path="solution-category" element={<SolutionCategory />} />
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
        <Route path="jobs" element={<Job />} />
        <Route path="jobs/create" element={<JobCreate />} />
        <Route path="jobs/:id/edit" element={<JobEdit />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="candidate" element={<Candidate />} />
        <Route path="about_us" element={<AdminAboutUs />} />
        <Route path="widget" element={<AdminWidget />} />
        <Route path="support" element={<AdminSupportPage />} />
        <Route path="location" element={<AdminLocationPage />} />
        {/* Optional: fallback */}
        <Route path="*" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}

export default App;
