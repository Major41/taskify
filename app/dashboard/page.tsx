"use client";

import { useEffect, useState } from "react";
import DashboardStats from "@/components/Dashboard/DashboardStats";
import {useAuth} from "@/contexts/AuthContext";

interface DashboardData {
  pendingTasks: number;
  inNegotiation: number;
  canceledTasks: number;
  expiredTasks: number;
  ongoingTasks: number;
  completedTasks: number;
  taskers: number;
  clients: number;
  requests: {
    pending: number;
    expired: number;
    declined: number;
    accepted?: number;
    completed?: number;
  };
  acceptedRequests: {
    pending: number;
    ongoing: number;
    inNegotiation: number;
    completed: number;
    cancelled: number;
    declined: number;
  };
}

export default function DashboardPage() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );

  useEffect(() => {
    loadDashboardData();
  }, []);

  // console.log("Current User:", user);

  const fetchRequestsByStatus = async (status: string): Promise<number> => {
    try {
      const response = await fetch(
        `https://tasksfy.com/v1/web/admin/requests/by/notificationStatus?notification_status=${status}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch ${status} requests`);
      }

      const data = await response.json();
      return data.requests?.length || 0;
    } catch (error) {
      console.error(`Error fetching ${status} requests:`, error);
      return 0;
    }
  };

  const fetchAcceptedRequestsByStatus = async (
    status: string
  ): Promise<number> => {
    try {
      const response = await fetch(
        `https://tasksfy.com/v1/web/admin/acceptedRequests/by/taskStatus?task_status=${status}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch ${status} accepted requests`);
      }

      const data = await response.json();
      console.log(`Fetched ${status} requests:`, data.acceptedRequests.length);

      return data.acceptedRequests.length || 0;
    } catch (error) {
      console.error(`Error fetching ${status} accepted requests:`, error);
      return 0;
    }
  };

  const loadDashboardData = async () => {
    try {
      // Fetch requests data
      const [pendingRequests, expiredRequests, declinedRequests, acceptedRequests, completedRequests] =
        await Promise.all([
          fetchRequestsByStatus("Pending"),
          fetchRequestsByStatus("Expired"),
          fetchRequestsByStatus("Declined"),
          fetchRequestsByStatus("Accepted"),
          fetchRequestsByStatus("Completed"),
        ]);

      // Fetch accepted requests data
      const [
        pendingAccepted,
        ongoingAccepted,
        inNegotiationAccepted,
        completedAccepted,
        cancelledAccepted,
        declinedAccepted,
      ] = await Promise.all([
        fetchAcceptedRequestsByStatus("Pending"),
        fetchAcceptedRequestsByStatus("Ongoing"),
        fetchAcceptedRequestsByStatus("In Negotiation"),
        fetchAcceptedRequestsByStatus("Completed"),
        fetchAcceptedRequestsByStatus("Cancelled"),
        fetchAcceptedRequestsByStatus("Declined"),
      ]);

      // For now, using mock data for other stats - you can replace with actual API calls
      const mockData: DashboardData = {
        pendingTasks: pendingAccepted,
        inNegotiation: inNegotiationAccepted,
        canceledTasks: cancelledAccepted,
        expiredTasks: expiredRequests,
        ongoingTasks: ongoingAccepted,
        completedTasks: completedAccepted,
        taskers: 71012,
        clients: 120021,
        requests: {
          pending: pendingRequests,
          expired: expiredRequests,
          declined: declinedRequests,
          accepted: acceptedRequests,
          completed: completedRequests,
        },
        acceptedRequests: {
          pending: pendingAccepted,
          ongoing: ongoingAccepted,
          inNegotiation: inNegotiationAccepted,
          completed: completedAccepted,
          cancelled: cancelledAccepted,
          declined: declinedAccepted,
        },
      };

      setDashboardData(mockData);
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
        requests: {
          pending: 150,
          expired: 45,
          declined: 23,
          accepted: 12,
          completed: 980,
        },
        acceptedRequests: {
          pending: 102,
          ongoing: 3012,
          inNegotiation: 203,
          completed: 9215,
          cancelled: 56,
          declined: 12,
        },
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
          Welcome back! Here&apos;s what&apos;s happening today.
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
