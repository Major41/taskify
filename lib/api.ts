// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// API endpoints
export const ENDPOINTS = {
  auth: {
    login: "/admin/login",
    logout: "/admin/logout",
  },
  users: {
    all: "/admin/users",
    withReviews: "/admin/users/with-reviews",
  },
  admin: {
    grantAccess: "/admin/grant-access",
  },
};

// Generic API call function
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("API call failed:", error);
    throw error;
  }
};

// Authenticated API call (using role-based auth)
export const authApiCall = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const user = localStorage.getItem("tasksfyUser");

  if (!user) {
    throw new Error("User not authenticated");
  }

  try {
    const userData = JSON.parse(user);
    if (userData.role !== "ADMIN" && userData.role !== "SUPER ADMIN") {
      throw new Error("Insufficient permissions");
    }
  } catch {
    throw new Error("Invalid user data");
  }

  return apiCall(endpoint, options);
};
