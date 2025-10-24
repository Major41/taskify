"use client";

import { useState } from "react";
import {
  Shield,
  ShieldCheck,
  ShieldOff,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle,
  User,
  Crown,
  Phone,
} from "lucide-react";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";

interface User {
  _id: string;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
  phone_number?: string;
  isTasker: boolean;
  role: "user" | "ADMIN" | "SUPER ADMIN";
  createdAt: string;
  isPhone_number_verified?: boolean;
}

// Interface for the API response
interface ApiUserResponse {
  user_id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  profile_url: string;
  role: "user" | "ADMIN" | "SUPER ADMIN";
  isPhone_number_verified: boolean;
  isTasker: boolean;
  dateOfRegistration: number;
  // Add other fields as needed
}

export default function AdminApprovalPage() {
  const { user: currentUser, token } = useAuth();
  const { loading: authLoading } = useProtectedRoute("SUPER ADMIN");

  const [searchedUser, setSearchedUser] = useState<User | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Function to map API response to frontend User interface
  const mapApiUserToFrontendUser = (apiUser: ApiUserResponse): User => {
    return {
      _id: apiUser.user_id,
      name: `${apiUser.first_name} ${apiUser.last_name}`.trim(),
      first_name: apiUser.first_name,
      last_name: apiUser.last_name,
      email: apiUser.email,
      avatar_url: apiUser.profile_url || undefined,
      phone_number: apiUser.phone_number,
      isTasker: apiUser.isTasker,
      role: apiUser.role,
      isPhone_number_verified: apiUser.isPhone_number_verified,
      createdAt: new Date(apiUser.dateOfRegistration).toISOString(),
    };
  };

  const searchUserByPhone = async () => {
    if (!phoneNumber.trim()) {
      showAlert("error", "Please enter a phone number");
      return;
    }

    try {
      setLoading(true);
      setSearchedUser(null);

      if (!token) {
        showAlert("error", "Authentication token not found");
        return;
      }

      // Format phone number - ensure it starts with +
      let formattedPhone = phoneNumber.trim();
      if (!formattedPhone.startsWith("+")) {
        formattedPhone = "+" + formattedPhone;
      }

      const response = await fetch(
        `https://tasksfy.com/v1/web/super/admin/user/by/phoneNumber?phone_number=${encodeURIComponent(
          formattedPhone
        )}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("API Response:", response);

      // Handle response - first get as text to avoid JSON parsing errors
      const responseText = await response.text();
      console.log("Response text:", responseText);

      let data;

      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        showAlert("error", "Invalid response from server");
        setSearchedUser(null);
        return;
      }

      console.log("Parsed data:", data);

      if (response.ok && data.user_id) {
        // Map the API response to your frontend User interface
        const mappedUser = mapApiUserToFrontendUser(data);
        setSearchedUser(mappedUser);
        showAlert("success", "User found successfully!");
      } else {
        showAlert("error", data.message || "User not found");
        setSearchedUser(null);
      }
    } catch (error) {
      console.error("Error searching user:", error);
      showAlert("error", "Failed to search user");
      setSearchedUser(null);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (
    userId: string,
    newRole: "USER" | "ADMIN" | "SUPER ADMIN"
  ) => {
    if (!currentUser || currentUser.role !== "SUPER ADMIN") {
      showAlert("error", "Only SUPER ADMIN can modify user roles");
      return;
    }

    try {
      setUpdating(userId);
      const response = await fetch("/api/admin/users/roles", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          role: newRole,
          currentUserRole: currentUser.role,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update the searched user's role
        setSearchedUser((prev) => (prev ? { ...prev, role: newRole } : null));
        showAlert("success", data.message);
      } else {
        showAlert("error", data.message);
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      showAlert("error", "Failed to update user role");
    } finally {
      setUpdating(null);
    }
  };

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "SUPER ADMIN":
        return <Crown className="h-4 w-4" />;
      case "ADMIN":
        return <ShieldCheck className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "SUPER ADMIN":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "ADMIN":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "SUPER ADMIN":
        return "Super Admin";
      case "ADMIN":
        return "Admin";
      default:
        return "USER";
    }
  };

  const clearSearch = () => {
    setPhoneNumber("");
    setSearchedUser(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!currentUser || currentUser.role !== "SUPER ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShieldOff className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-4">
            You need SUPER ADMIN privileges to access this page.
          </p>
          <div
            className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getRoleColor(
              currentUser?.role || "USER"
            )}`}
          >
            {getRoleIcon(currentUser?.role || "USER")}
            <span className="ml-2">
              Your role: {getRoleBadge(currentUser?.role || "USER")}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Alert */}
      {alert && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
            alert.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {alert.type === "success" ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{alert.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Shield className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Admin Approval</h1>
        </div>
        <p className="text-gray-600">
          Search users by phone number and manage their admin roles.
        </p>

        {/* Current User Role Indicator */}
        {currentUser && (
          <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border bg-white">
            <Shield className="h-4 w-4 mr-2" />
            Your role:
            <span
              className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
                currentUser.role
              )}`}
            >
              {getRoleIcon(currentUser.role)}
              <span className="ml-1">{getRoleBadge(currentUser.role)}</span>
            </span>
          </div>
        )}
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <Phone className="h-5 w-5 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">
            Search User by Phone Number
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Enter phone number (e.g., +254702891008)"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    searchUserByPhone();
                  }
                }}
                className="w-full text-black pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
          </div>

          <div className="flex space-x-2">
            <button
              onClick={searchUserByPhone}
              disabled={!phoneNumber.trim() || loading}
              className="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              {loading ? "Searching..." : "Search"}
            </button>

            {(searchedUser || phoneNumber) && (
              <button
                onClick={clearSearch}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* User Details Section */}
      {searchedUser && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              User Details
            </h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Information */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900">
                  Profile Information
                </h3>

                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 h-16 w-16">
                    {searchedUser.avatar_url ? (
                      <img
                        className="h-16 w-16 rounded-full"
                        src={searchedUser.avatar_url}
                        alt={searchedUser.name}
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                        <User className="h-8 w-8 text-gray-600" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">
                      {searchedUser.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {searchedUser.first_name} {searchedUser.last_name}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <div className="text-gray-900 mt-1">
                      {searchedUser.email}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Phone:</span>
                    <div className="text-gray-900 mt-1">
                      {searchedUser.phone_number}
                      {searchedUser.isPhone_number_verified && (
                        <span className="ml-2 text-green-600 text-xs">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium text-gray-700">
                        User Type:
                      </span>
                      <div className="mt-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            searchedUser.isTasker
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {searchedUser.isTasker ? "Tasker" : "Client"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Joined:</span>
                      <div className="text-gray-900 mt-1">
                        {new Date(searchedUser.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Role Management */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900">
                  Role Management
                </h3>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium text-gray-700">
                      Current Role:
                    </span>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(
                        searchedUser.role
                      )}`}
                    >
                      {getRoleIcon(searchedUser.role)}
                      <span className="ml-2">
                        {getRoleBadge(searchedUser.role)}
                      </span>
                    </span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 mb-3">
                      Change user role:
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {/* Make Admin - show for users */}
                      {searchedUser.role === "USER" && (
                        <button
                          onClick={() =>
                            updateUserRole(searchedUser._id, "ADMIN")
                          }
                          disabled={updating === searchedUser._id}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {updating === searchedUser._id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <ShieldCheck className="h-4 w-4 mr-2" />
                          )}
                          Make Admin
                        </button>
                      )}

                      {/* Make Super Admin - show for users and admins */}
                      {(searchedUser.role === "USER" ||
                        searchedUser.role === "ADMIN") && (
                        <button
                          onClick={() =>
                            updateUserRole(searchedUser._id, "SUPER ADMIN")
                          }
                          disabled={updating === searchedUser._id}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {updating === searchedUser._id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Crown className="h-4 w-4 mr-2" />
                          )}
                          Make Super Admin
                        </button>
                      )}

                      {/* Remove Admin - show for admins */}
                      {searchedUser.role === "ADMIN" && (
                        <button
                          onClick={() =>
                            updateUserRole(searchedUser._id, "USER")
                          }
                          disabled={updating === searchedUser._id}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {updating === searchedUser._id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <ShieldOff className="h-4 w-4 mr-2" />
                          )}
                          Remove Admin
                        </button>
                      )}

                      {/* Remove Super Admin - show for super admins */}
                      {searchedUser.role === "SUPER ADMIN" && (
                        <button
                          onClick={() =>
                            updateUserRole(searchedUser._id, "USER")
                          }
                          disabled={updating === searchedUser._id}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {updating === searchedUser._id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <ShieldOff className="h-4 w-4 mr-2" />
                          )}
                          Remove Super Admin
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No User Found State */}
      {!searchedUser && phoneNumber && !loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No user found
          </h3>
          <p className="text-gray-500">
            No user found with the phone number: <strong>{phoneNumber}</strong>
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Please check the phone number and try again.
          </p>
        </div>
      )}

      {/* Initial State */}
      {!searchedUser && !phoneNumber && !loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Search for a user
          </h3>
          <p className="text-gray-500">
            Enter a phone number above to search for a user and manage their
            admin roles.
          </p>
        </div>
      )}
    </div>
  );
}
