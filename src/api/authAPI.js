// src/api/authAPI.js
const API_URL = process.env.REACT_APP_API_URL || "";

// Google OAuth login
export const googleLogin = async (idToken) => {
  const res = await fetch(`${API_URL}/auth/google`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id_token: idToken }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Login failed' }));
    throw new Error(error.detail || 'Login failed');
  }

  return res.json();
};

// Check user session
export const checkSession = async (token) => {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error('Session expired');
  }

  return res.json();
};

// Logout
export const logout = async (token) => {
  const res = await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  return res.ok;
};