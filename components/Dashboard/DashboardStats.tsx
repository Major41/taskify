"use client";

import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
import {
  ClipboardList,
  Handshake,
  XCircle,
  Clock,
  RefreshCw,
  CheckCircle,
  Users,
  UserCheck,
  TrendingUp,
  BarChart3,
} from "lucide-react";

// Register Chart.js components
Chart.register(...registerables);

interface DashboardStatsProps {
  data: {
    pendingTasks: number;
    inNegotiation: number;
    canceledTasks: number;
    expiredTasks: number;
    ongoingTasks: number;
    completedTasks: number;
    taskers: number;
    clients: number;
  };
}

export default function DashboardStats({ data }: DashboardStatsProps) {
  const taskersChartRef = useRef<HTMLCanvasElement>(null);
  const clientsChartRef = useRef<HTMLCanvasElement>(null);
  const taskersChartInstance = useRef<Chart | null>(null);
  const clientsChartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    return () => {
      if (taskersChartInstance.current) {
        taskersChartInstance.current.destroy();
      }
      if (clientsChartInstance.current) {
        clientsChartInstance.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (taskersChartRef.current && clientsChartRef.current) {
      if (taskersChartInstance.current) {
        taskersChartInstance.current.destroy();
      }
      if (clientsChartInstance.current) {
        clientsChartInstance.current.destroy();
      }

      // Taskers Chart
      taskersChartInstance.current = new Chart(taskersChartRef.current, {
        type: "doughnut",
        data: {
          labels: ["Completed", "Ongoing", "Pending"],
          datasets: [
            {
              data: [data.completedTasks, data.ongoingTasks, data.pendingTasks],
              backgroundColor: ["#10B981", "#F59E0B", "#6B7280"],
              borderWidth: 2,
              borderColor: "#FFFFFF",
              hoverOffset: 8,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "75%",
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                padding: 15,
                usePointStyle: true,
                font: {
                  size: 11,
                },
              },
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  return `${context.label}: ${context.parsed.toLocaleString()}`;
                },
              },
            },
          },
        },
      });

      // Clients Chart
      clientsChartInstance.current = new Chart(clientsChartRef.current, {
        type: "doughnut",
        data: {
          labels: ["Completed", "Ongoing", "Pending"],
          datasets: [
            {
              data: [data.completedTasks, data.ongoingTasks, data.pendingTasks],
              backgroundColor: ["#10B981", "#F59E0B", "#6B7280"],
              borderWidth: 2,
              borderColor: "#FFFFFF",
              hoverOffset: 8,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "75%",
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                padding: 15,
                usePointStyle: true,
                font: {
                  size: 11,
                },
              },
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  return `${context.label}: ${context.parsed.toLocaleString()}`;
                },
              },
            },
          },
        },
      });
    }
  }, [data]);

  const statsCards = [
    {
      title: "Pending Tasks",
      value: data.pendingTasks,
      icon: ClipboardList,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      textColor: "text-blue-700",
      filter: "pending",
    },
    {
      title: "In Negotiation",
      value: data.inNegotiation,
      icon: Handshake,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      textColor: "text-purple-700",
      filter: "negotiation",
    },
    {
      title: "Canceled Tasks",
      value: data.canceledTasks,
      icon: XCircle,
      color: "bg-red-500",
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
      textColor: "text-red-700",
      filter: "canceled",
    },
    {
      title: "Expired Tasks",
      value: data.expiredTasks,
      icon: Clock,
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      textColor: "text-orange-700",
      filter: "expired",
    },
    {
      title: "Ongoing Tasks",
      value: data.ongoingTasks,
      icon: RefreshCw,
      color: "bg-yellow-500",
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600",
      textColor: "text-yellow-700",
      filter: "ongoing",
    },
    {
      title: "Completed Tasks",
      value: data.completedTasks,
      icon: CheckCircle,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      textColor: "text-green-700",
      filter: "completed",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statsCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-lg shadow-xs border border-gray-200 p-4 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-gray-300 group"
              onClick={() =>
                (window.location.href = `/orders?filter=${stat.filter}`)
              }
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-600 truncate">
                    {stat.title}
                  </p>
                  <p className="text-xl font-bold text-gray-900 mt-1 truncate">
                    {stat.value.toLocaleString()}
                  </p>
                </div>
                <div
                  className={`p-2 rounded-lg ${stat.bgColor} group-hover:scale-110 transition-transform duration-200`}
                >
                  <IconComponent className={`w-4 h-4 ${stat.iconColor}`} />
                </div>
              </div>
              <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full ${stat.color} transition-all duration-500`}
                  style={{
                    width: `${Math.min((stat.value / 10000) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Taskers Card */}
        <div className="bg-white rounded-lg shadow-xs border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Taskers
                </h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {data.taskers.toLocaleString()}
                </p>
              </div>
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="h-48">
            <canvas ref={taskersChartRef} />
          </div>
        </div>

        {/* Clients Card */}
        <div className="bg-white rounded-lg shadow-xs border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <UserCheck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Clients
                </h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {data.clients.toLocaleString()}
                </p>
              </div>
            </div>
            <BarChart3 className="w-5 h-5 text-blue-500" />
          </div>
          <div className="h-48">
            <canvas ref={clientsChartRef} />
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-900">Success Rate</p>
              <p className="text-lg font-bold text-blue-900">
                {Math.round(
                  (data.completedTasks /
                    (data.completedTasks + data.canceledTasks)) *
                    100
                )}
                %
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-900">Active Tasks</p>
              <p className="text-lg font-bold text-green-900">
                {(
                  data.ongoingTasks +
                  data.pendingTasks +
                  data.inNegotiation
                ).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center space-x-3">
            <Users className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-purple-900">Total Users</p>
              <p className="text-lg font-bold text-purple-900">
                {(data.taskers + data.clients).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
