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
  FileText,
  ThumbsUp,
  ThumbsDown,
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
  };
}

export default function DashboardStats({ data }: DashboardStatsProps) {
  const requestsChartRef = useRef<HTMLCanvasElement>(null);
  const acceptedRequestsChartRef = useRef<HTMLCanvasElement>(null);
  const requestsChartInstance = useRef<Chart | null>(null);
  const acceptedRequestsChartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    return () => {
      if (requestsChartInstance.current) {
        requestsChartInstance.current.destroy();
      }
      if (acceptedRequestsChartInstance.current) {
        acceptedRequestsChartInstance.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (requestsChartRef.current && acceptedRequestsChartRef.current) {
      if (requestsChartInstance.current) {
        requestsChartInstance.current.destroy();
      }
      if (acceptedRequestsChartInstance.current) {
        acceptedRequestsChartInstance.current.destroy();
      }

      // Requests Chart (Pending, Expired, Declined)
            requestsChartInstance.current = new Chart(requestsChartRef.current, {
              type: "doughnut",
              data: {
                labels: ["Pending", "Expired", "Declined", "Accepted"],
                datasets: [
                  {
                    data: [
                      data.requests.pending,
                      data.requests.expired,
                      data.requests.declined,
                      data.requests.accepted ?? 0,
                    ],
                    backgroundColor: ["#F59E0B", "#EF4444", "#6B7280", "#10B981"],
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

      // Accepted Requests Chart (Completed, Ongoing, Pending, In Negotiation, Cancelled, Declined)
      acceptedRequestsChartInstance.current = new Chart(
        acceptedRequestsChartRef.current,
        {
          type: "doughnut",
          data: {
            labels: [
              "Completed",
              "Ongoing",
              "In Negotiation",
              "Cancelled",
            ],
            datasets: [
              {
                data: [
                  data.acceptedRequests.completed,
                  data.acceptedRequests.ongoing,
                  data.acceptedRequests.inNegotiation,
                  data.acceptedRequests.cancelled,
                ],
                backgroundColor: [
                  "#10B981", // Completed - Green
                  "#F59E0B", // Ongoing - Amber
                  "#8B5CF6", // In Negotiation - Purple
                  "#EF4444", // Cancelled - Red
                ],
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
                    return `${
                      context.label
                    }: ${context.parsed.toLocaleString()}`;
                  },
                },
              },
            },
          },
        }
      );
    }
  }, [data]);

  // Accepted Requests Cards
  const acceptedRequestsCards = [
    {
      title: "Completed Tasks",
      value: data.acceptedRequests.completed,
      icon: CheckCircle,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      textColor: "text-green-700",
    },
    {
      title: "Ongoing Tasks",
      value: data.acceptedRequests.ongoing,
      icon: RefreshCw,
      color: "bg-yellow-500",
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600",
      textColor: "text-yellow-700",
    },
    {
      title: "In Negotiation",
      value: data.acceptedRequests.inNegotiation,
      icon: Handshake,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      textColor: "text-purple-700",
    },
    {
      title: "Cancelled Tasks",
      value: data.acceptedRequests.cancelled,
      icon: XCircle,
      color: "bg-red-500",
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
      textColor: "text-red-700",
    },
  ];

  // Requests Cards
  const requestsCards = [
    {
      title: "Pending Requests",
      value: data.requests.pending,
      icon: ClipboardList,
      color: "bg-amber-500",
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
      textColor: "text-amber-700",
    },
    {
      title: "Expired Requests",
      value: data.requests.expired,
      icon: Clock,
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      textColor: "text-orange-700",
    },
    {
      title: "Declined Requests",
      value: data.requests.declined,
      icon: ThumbsDown,
      color: "bg-gray-500",
      bgColor: "bg-gray-50",
      iconColor: "text-gray-600",
      textColor: "text-gray-700",
    },
    {
      title: "Accepted Requests",
      value: data.requests.accepted ?? 0,
      icon: ThumbsUp,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      textColor: "text-gray-700",
    },
  ];

  const totalRequests =
    data.requests.pending + data.requests.expired + data.requests.declined + (data.requests.accepted ?? 0);
  const totalAcceptedRequests =
    data.acceptedRequests.completed +
    data.acceptedRequests.ongoing +
    data.acceptedRequests.inNegotiation +
    data.acceptedRequests.cancelled;

  const Card = ({ stat }: { stat: (typeof acceptedRequestsCards)[0] }) => {
    const IconComponent = stat.icon;
    return (
      <div className="bg-white rounded-lg shadow-xs border border-gray-200 p-4 hover:shadow-md transition-all duration-200 hover:border-gray-300 group">
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
  };

  return (
    <div className="space-y-8">
      {/* Accepted Requests Section */}
      <div>
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-green-50 rounded-lg">
            <ThumbsUp className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Accepted Requests
            </h2>
            <p className="text-sm text-gray-600">
              Tasks that have been accepted and are in progress
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
          {acceptedRequestsCards.map((stat, index) => (
            <Card key={`accepted-${index}`} stat={stat} />
          ))}
        </div>
      </div>

      {/* Requests Section */}
      <div>
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-50 rounded-lg">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Requests</h2>
            <p className="text-sm text-gray-600">
              Task requests awaiting action
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {requestsCards.map((stat, index) => (
            <Card key={`request-${index}`} stat={stat} />
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Accepted Requests Chart */}
        <div className="bg-white rounded-lg shadow-xs border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <ThumbsUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Accepted Requests Distribution
                </h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {totalAcceptedRequests.toLocaleString()}
                </p>
              </div>
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="h-48">
            <canvas ref={acceptedRequestsChartRef} />
          </div>
        </div>

        {/* Requests Chart */}
        <div className="bg-white rounded-lg shadow-xs border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Requests Distribution
                </h3>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {totalRequests.toLocaleString()}
                </p>
              </div>
            </div>
            <BarChart3 className="w-5 h-5 text-blue-500" />
          </div>
          <div className="h-48">
            <canvas ref={requestsChartRef} />
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-900">
                Acceptance Rate
              </p>
              <p className="text-lg font-bold text-green-900">
                {totalRequests > 0
                  ? Math.round(
                      (totalAcceptedRequests /
                        (totalRequests + totalAcceptedRequests)) *
                        100
                    )
                  : 0}
                %
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-900">Active Tasks</p>
              <p className="text-lg font-bold text-blue-900">
                {(
                  data.acceptedRequests.ongoing +
                  data.acceptedRequests.pending +
                  data.acceptedRequests.inNegotiation
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
