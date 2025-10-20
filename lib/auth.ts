export interface LoginCredentials {
  phone_number: string;
  password: string;
}

export interface User {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  role: "ADMIN" | "SUPER ADMIN" | "USER";
  avatar_url?: string;
  isTasker: boolean;
  isPhone_number_verified: boolean;
  created_at: string;
}

export interface AuthResponse {
  success: boolean;
  userWithReviews?: {
    user: User;
  };
  token?: string;
  message?: string;
}

// Auth service functions using direct API calls
export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log("Login attempt with:", {
      ...credentials,
      password: "[HIDDEN]",
    });

    // Use URLSearchParams for form data as required by backend
    const formData = new URLSearchParams();
    formData.append("phone_number", credentials.phone_number);
    formData.append("password", credentials.password);

    const response = await fetch(
      "https://tasksfy.com/v1/web/admin/users/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      }
    );

    const data = await response.json();
    console.log("Login API response:", data);

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    // Return the data directly - let the component handle storing in context
    return data;
  },

  // These functions are now handled by the AuthContext
  // No more localStorage operations here
};
