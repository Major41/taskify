// app/taskers/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import TaskersTable from "@/components/Taskers/TaskersTable";
import TaskersFilters from "@/components/Taskers/TaskersFilters";
import TaskerStatsCards from "@/components/Taskers/TaskerStatsCards";
import { Tasker, TaskerStats } from "@/types/tasker";

export default function TaskersPage() {
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
      const response = await fetch("/api/admin/taskers");

      if (!response.ok) {
        throw new Error("Failed to fetch taskers");
      }

      const data = await response.json();

      if (data.success) {
        setTaskers(data.data);
      } else {
        throw new Error(data.message || "Failed to load taskers");
      }
    } catch (error) {
      console.error("Failed to load taskers:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadTaskerStats = async () => {
    try {
      const response = await fetch("/api/admin/taskers/stats");

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        }
      }
    } catch (error) {
      console.error("Failed to load tasker stats:", error);
    }
  };

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
          tasker.skills.some((skill) => skill.toLowerCase().includes(query))
      );
    }

    setFilteredTaskers(filtered);
  };

  const handleSuspendTasker = async (taskerId: string, reason: string) => {
    try {
      const response = await fetch("/api/admin/taskers/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
      }
    } catch (error) {
      console.error("Failed to suspend tasker:", error);
    }
  };

  const handleReinstateTasker = async (taskerId: string) => {
    try {
      const response = await fetch("/api/admin/taskers/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskerId,
          action: "reinstate",
        }),
      });

      if (response.ok) {
        await loadTaskers();
        await loadTaskerStats();
      }
    } catch (error) {
      console.error("Failed to reinstate tasker:", error);
    }
  };

  const handleSendMessage = async (taskerId: string, message: string) => {
    try {
      const response = await fetch("/api/admin/taskers/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskerId,
          message,
        }),
      });

      if (response.ok) {
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to send message:", error);
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
              {filteredTaskers.length} taskers found
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

      {/* Tasker Statistics */}
      {stats && <TaskerStatsCards stats={stats} />}

      {/* Taskers Table */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200/60 overflow-hidden">
        <TaskersTable
          taskers={filteredTaskers}
          onSuspendTasker={handleSuspendTasker}
          onReinstateTasker={handleReinstateTasker}
          onSendMessage={handleSendMessage}
        />
      </div>

      {/* Copyright Footer */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        Copyright Tasksfy Inc © 2025.
      </div>
    </div>
  );
}
