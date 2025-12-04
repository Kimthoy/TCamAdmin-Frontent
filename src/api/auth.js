// src/api/auth.js
import api from "./index";

export const login = async (email, password) => {
  const response = await api.post("/login", { email, password });

  const { token, user } = response.data;

  localStorage.setItem("adminToken", token);
  localStorage.setItem("adminAuthenticated", "true");
  localStorage.setItem("adminUser", JSON.stringify(user));

  return response.data;
};

export const logout = async () => {
  try {
    await api.post("/logout");
  } catch (err) {
    console.error("Logout failed");
  } finally {
    localStorage.clear();
    window.location.href = "/login";
  }
};

export const getMe = async () => {
  const response = await api.get("/me");
  return response.data;
};
