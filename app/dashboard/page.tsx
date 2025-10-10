"use client";

import { useEffect, useState } from "react";
import DashboardStats from "@/components/Dashboard/DashboardStats";

interface DashboardData {
  pendingTasks: number;
  inNegotiation: number;
  canceledTasks: number;
  expiredTasks: number;
  ongoingTasks: number;
  completedTasks: number;
  taskers: number;
  clients: number;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await fetch("/api/admin/stats");

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const data = await response.json();
      console.log(data)

      if (data.success) {
        setDashboardData(data.data);
      } else {
        throw new Error(data.message || "Failed to load dashboard data");
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      // Fallback to mock data if API fails
      const mockData: DashboardData = {
        pendingTasks: 102,
        inNegotiation: 203,
        canceledTasks: 56,
        expiredTasks: 91,
        ongoingTasks: 3012,
        completedTasks: 9215,
        taskers: 71012,
        clients: 120021,
      };
      setDashboardData(mockData);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Welcome Banner */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      {/* Dashboard Stats */}
      {dashboardData && <DashboardStats data={dashboardData} />}

      {/* Copyright Footer */}
      <div className="mt-12 text-center text-gray-500 text-sm">
        Copyright Tasksfy Inc © 2025.
      </div>
    </div>
  );
}
