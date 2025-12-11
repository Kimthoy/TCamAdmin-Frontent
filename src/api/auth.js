import api from "./index";

// =====================================
// LOGIN (JWT)
// =====================================
export const login = async (email, password) => {
  const response = await api.post("/login", { email, password });

  const { token, user } = response.data;

  if (!token) {
    throw new Error("Login failed: Token not received");
  }

  // Store JWT (admin or normal user)
  localStorage.setItem("adminToken", token);
  localStorage.setItem("adminAuthenticated", "true");
  localStorage.setItem("adminUser", JSON.stringify(user));

  return response.data;
};

// =====================================
// LOGOUT (invalidate JWT)
// =====================================
export const logout = async () => {
  try {
    await api.post("/logout"); // JWT invalidated server-side
  } catch (err) {
    console.warn("Logout API failed, clearing client token...");
  }

  // Clear local storage
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminAuthenticated");
  localStorage.removeItem("adminUser");

  window.location.href = "/login";
};

// =====================================
// GET AUTHENTICATED USER (JWT)
// =====================================
export const getMe = async () => {
  const response = await api.get("/me");
  return response.data;
};

// =====================================
// CHANGE PASSWORD
// =====================================
export const changePassword = async (
  currentPassword,
  password,
  passwordConfirmation
) => {
  const payload = {
    current_password: currentPassword,
    password,
    password_confirmation: passwordConfirmation,
  };

  const response = await api.post("/user/password", payload);
  return response.data;
};
