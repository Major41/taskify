"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  ShieldCheck,
  ShieldOff,
  Users,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle,
  User,
  Crown,
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

export default function AdminApprovalPage() {
  const { user: currentUser } = useAuth();
  const { loading: authLoading } = useProtectedRoute("SUPER ADMIN");

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<
    "all" | "USER" | "ADMIN" | "SUPER ADMIN"
  >("all");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/users/roles");
      const data = await response.json();

      if (data.success) {
        setUsers(data.data);
      } else {
        showAlert("error", data.message || "Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      showAlert("error", "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.first_name.toLowerCase().includes(query) ||
          user.last_name.toLowerCase().includes(query)
      );
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
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
        setUsers((prev) =>
          prev.map((user) =>
            user._id === userId ? { ...user, role: newRole } : user
          )
        );
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

  if (authLoading || loading) {
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
              currentUser?.role || "user"
            )}`}
          >
            {getRoleIcon(currentUser?.role || "user")}
            <span className="ml-2">
              Your role: {getRoleBadge(currentUser?.role || "user")}
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
          Manage user roles and permissions. Only SUPER ADMIN can modify roles.
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

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-black pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="USER">Users</option>
              <option value="ADMIN">Admins</option>
              <option value="SUPER ADMIN">Super Admins</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Users ({filteredUsers.length})
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>Total: {users.length}</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr
                  key={user._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {user.avatar_url ? (
                          <img
                            className="h-10 w-10 rounded-full"
                            src={user.avatar_url}
                            alt={user.name}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          Joined {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                    <div className="text-sm text-gray-500">
                      {user.phone_number || "No phone"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.isTasker
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {user.isTasker ? "Tasker" : "Client"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(
                        user.role
                      )}`}
                    >
                      {getRoleIcon(user.role)}
                      <span className="ml-2">{getRoleBadge(user.role)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {/* FIXED: Show actions for all users except current SUPER ADMIN */}
                    {currentUser &&
                      currentUser.role === "SUPER ADMIN" &&
                      user._id !== currentUser.id && (
                        <div className="flex space-x-2">
                          {/* Make Admin - show for users */}
                          {user.role === "USER" && (
                            <button
                              onClick={() => updateUserRole(user._id, "ADMIN")}
                              disabled={updating === user._id}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {updating === user._id ? (
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              ) : (
                                <ShieldCheck className="h-3 w-3 mr-1" />
                              )}
                              Make Admin
                            </button>
                          )}

                         

                          {/* Remove Admin - show for admins */}
                          {user.role === "ADMIN" && (
                            <button
                              onClick={() => updateUserRole(user._id, "USER")}
                              disabled={updating === user._id}
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {updating === user._id ? (
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              ) : (
                                <ShieldOff className="h-3 w-3 mr-1" />
                              )}
                              Remove Admin
                            </button>
                          )}

                      
                         
                        </div>
                      )}

                    {/* Show no permissions for non-SUPER ADMIN users or current user */}
                    {(!currentUser ||
                      currentUser.role !== "SUPER ADMIN" ||
                      user._id === currentUser.id) && (
                      <span className="text-gray-400 text-sm">
                        {user._id === currentUser?.id
                          ? "Current user"
                          : "No permissions"}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No users found</p>
              <p className="text-gray-400 text-sm mt-1">
                {searchQuery || roleFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "No users in the system"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
