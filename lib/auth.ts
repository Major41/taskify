export interface LoginCredentials {
  phone_number: string;
  password: string;
}

export interface User {
  _id: string;
  name: string;
  email?: string;
  phone_number: string;
  role: "ADMIN" | "SUPER ADMIN" | "USER";
  avatar_url?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
}

// Auth service functions using Next.js API routes
export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log("Login attempt with:", credentials);

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    console.log("Login API response:", data);

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    // Store user data
    if (data.success && data.user) {
      localStorage.setItem("tasksfyUser", JSON.stringify(data.user));
      console.log("User stored in localStorage");
      console.log("Stored user:", data.user);
    }

    return data;
  },

  isAuthenticated(): boolean {
    if (typeof window === "undefined") {
      console.log("SSR mode - returning false");
      return false;
    }

    try {
      const user = localStorage.getItem("tasksfyUser");
      console.log("Retrieved from storage:", user);

      if (!user) {
        console.log("No user found in storage");
        return false;
      }

      const userData: User = JSON.parse(user);
      const isAuth =
        userData.role === "ADMIN" || userData.role === "SUPER ADMIN";
      console.log("User role:", userData.role, "Authenticated:", isAuth);

      return isAuth;
    } catch (error) {
      console.error("Auth check error:", error);
      return false;
    }
  },

  // Get current user
  getCurrentUser(): User | null {
    if (typeof window === "undefined") return null;

    const user = localStorage.getItem("tasksfyUser");
    if (!user) return null;

    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  },
};
