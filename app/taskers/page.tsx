// app/taskers/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import TaskersTable from "@/components/Taskers/TaskersTable";
import TaskersFilters from "@/components/Taskers/TaskersFilters";
import { Tasker, TaskerStats } from "@/types/tasker";
import { useAuth } from "@/contexts/AuthContext";

export default function TaskersPage() {
  const { token } = useAuth();
  const [taskers, setTaskers] = useState<Tasker[]>([]);
  const [filteredTaskers, setFilteredTaskers] = useState<Tasker[]>([]);
  const [stats, setStats] = useState<TaskerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<
    "all" | "active" | "suspended"
  >("all");
  const searchParams = useSearchParams();

  useEffect(() => {
    loadTaskers();
    loadTaskerStats();
  }, []);

  useEffect(() => {
    // Handle URL filter parameters
    const filter = searchParams.get("filter");
    if (filter && ["all", "active", "suspended"].includes(filter)) {
      setSelectedStatus(filter as "all" | "active" | "suspended");
    }
  }, [searchParams]);

  useEffect(() => {
    filterTaskers();
  }, [taskers, searchQuery, selectedStatus]);

  const loadTaskers = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://tasksfy.com/v1/web/admin/taskersWithReviews", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch taskers");
      }

      const data = await response.json();
      console.log("Taskers API Response:", data.taskersWithReviewsAndSkills); // Debug log

      if (data.success && data.taskersWithReviewsAndSkills) {
        // Transform the API response to match our Tasker interface
        const transformedTaskers = data.taskersWithReviewsAndSkills.map(
          (tasker: any) => ({
            id: tasker.tasker.tasker_id,
            name:
              `${tasker.tasker.user?.first_name || ""} ${
                tasker.tasker.user?.last_name
              }`.trim() || "Unknown Tasker",
            email: tasker.tasker.user?.email,
            phone: tasker.tasker.user?.phone_number,
            profile_picture: tasker.tasker.user?.profile_url,
            skills: tasker.skills || [],
            rating: tasker.tasker.tasker_average_rating || 0,
            completed_tasks: tasker.completed_tasks_count || 0,
            is_approved: tasker.tasker.is_approved,
            is_accepting_requests: tasker.tasker.is_accepting_requests,
            joined_date: tasker.tasker.tasker_reg_date,
            category: tasker.category,
            location: tasker.location,
            veverification_level1_status:
              tasker.tasker.user.verification_level1_status,
            verification_level2_status:
              tasker.tasker.user.verification_level1_status,
            verification_level3_status:
              tasker.tasker.user.verification_level3_status,
            verification_level4_status:
              tasker.tasker.user.verification_level4_status,
            verification_level5_status:
              tasker.tasker.user.verification_level5_status,
            reviews: tasker.reviews || [],
            walletBalance: tasker.tasker.user.walletBalance,
            tasker_average_rating: tasker.tasker.tasker_average_rating,
          })
        );

        setTaskers(transformedTaskers);
      } else {
        throw new Error(data.message || "Failed to load taskers");
      }
    } catch (error) {
      console.error("Failed to load taskers:", error);
      setTaskers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTaskerStats = async () => {
    try {
      // Calculate stats from the taskers data
      const totalTaskers = taskers.length;
      const activeTaskers = taskers.filter(
        (t) => t.is_approved && t.is_accepting_requests
      ).length;
      const suspendedTaskers = taskers.filter(
        (t) => !t.is_approved || !t.is_accepting_requests
      ).length;
      const totalCompletedTasks = taskers.reduce(
        (sum, tasker) => sum + (tasker.completed_tasks || 0),
        0
      );
      const averageRating =
        taskers.length > 0
          ? taskers.reduce((sum, tasker) => sum + (tasker.rating || 0), 0) /
            taskers.length
          : 0;

      const calculatedStats: TaskerStats = {
        total: totalTaskers,
        active: activeTaskers,
        suspended: suspendedTaskers,
        completed_tasks: totalCompletedTasks,
        average_rating: parseFloat(averageRating.toFixed(1)),
        new_this_month: taskers.filter((t) => {
          const joinedDate = new Date(t.joined_date);
          const now = new Date();
          return (
            joinedDate.getMonth() === now.getMonth() &&
            joinedDate.getFullYear() === now.getFullYear()
          );
        }).length,
      };

      setStats(calculatedStats);
    } catch (error) {
      console.error("Failed to load tasker stats:", error);
    }
  };

  // Reload stats when taskers change
  useEffect(() => {
    if (taskers.length > 0) {
      loadTaskerStats();
    }
  }, [taskers]);

  const filterTaskers = () => {
    let filtered = taskers;

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter((tasker) =>
        selectedStatus === "active"
          ? tasker.is_approved && tasker.is_accepting_requests
          : !tasker.is_approved || !tasker.is_accepting_requests
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (tasker) =>
          tasker.name.toLowerCase().includes(query) ||
          tasker.phone.toLowerCase().includes(query) ||
          tasker.email.toLowerCase().includes(query) ||
          tasker.skills.some((skill) => skill.toLowerCase().includes(query)) ||
          (tasker.category && tasker.category.toLowerCase().includes(query)) ||
          (tasker.location && tasker.location.toLowerCase().includes(query))
      );
    }

    setFilteredTaskers(filtered);
  };

  const handleSuspendTasker = async (taskerId: string, reason: string) => {
    try {
      // Note: You'll need to implement the suspend API endpoint
      const response = await fetch("/api/admin/taskers/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          taskerId,
          action: "suspend",
          reason,
        }),
      });

      if (response.ok) {
        await loadTaskers();
        await loadTaskerStats();
        alert("Tasker suspended successfully!");
      } else {
        throw new Error("Failed to suspend tasker");
      }
    } catch (error) {
      console.error("Failed to suspend tasker:", error);
      alert("Failed to suspend tasker. Please try again.");
    }
  };

  const handleReinstateTasker = async (taskerId: string) => {
    try {
      // Note: You'll need to implement the reinstate API endpoint
      const response = await fetch("/api/admin/taskers/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          taskerId,
          action: "reinstate",
        }),
      });

      if (response.ok) {
        await loadTaskers();
        await loadTaskerStats();
        alert("Tasker reinstated successfully!");
      } else {
        throw new Error("Failed to reinstate tasker");
      }
    } catch (error) {
      console.error("Failed to reinstate tasker:", error);
      alert("Failed to reinstate tasker. Please try again.");
    }
  };

  const handleSendMessage = async (taskerId: string, message: string) => {
    try {
      // Note: You'll need to implement the message API endpoint
      const response = await fetch("/api/admin/taskers/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          taskerId,
          message,
        }),
      });

      if (response.ok) {
        alert("Message sent successfully!");
        return true;
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message. Please try again.");
      return false;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading taskers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Taskers Account Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Showing {filteredTaskers.length} of {taskers.length} taskers
              {selectedStatus !== "all" && ` (filtered by ${selectedStatus})`}
            </p>
          </div>

          <div className="mt-4 lg:mt-0">
            <TaskersFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              totalTaskers={taskers.length}
              filteredCount={filteredTaskers.length}
            />
          </div>
        </div>
      </div>

      {/* Taskers Table */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200/60 overflow-hidden">
        <TaskersTable
          taskers={filteredTaskers}
          onSuspendTasker={handleSuspendTasker}
          onReinstateTasker={handleReinstateTasker}
          onSendMessage={handleSendMessage}
        />
      </div>

      {/* Empty State */}
      {filteredTaskers.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No taskers found
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {taskers.length === 0
              ? "No taskers have registered yet. Taskers will appear here once they create accounts."
              : "No taskers match your current filters. Try adjusting your search criteria."}
          </p>
          {(searchQuery || selectedStatus !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedStatus("all");
              }}
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Copyright Footer */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        Copyright Tasksfy Inc © 2025.
      </div>
    </div>
  );
}
