// components/Clients/ClientStatsCards.tsx
import {
  Users,
  UserCheck,
  UserX,
  Star,
  Clock,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import { ClientStats } from "@/types/client";

interface ClientStatsCardsProps {
  stats: ClientStats;
}

export default function ClientStatsCards({ stats }: ClientStatsCardsProps) {
  // Calculate percentages for progress bars
  const calculatePercentage = (
    value: number,
    max: number = stats.totalClients
  ) => {
    if (max === 0) return 0;
    return Math.min((value / max) * 100, 100);
  };

  const statCards = [
    {
      title: "Total Clients",
      value: stats.totalClients.toString(),
      percentage: 100,
      icon: Users,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      description: "All registered clients",
    },
    {
      title: "Active Clients",
      value: stats.activeClients.toString(),
      percentage: calculatePercentage(stats.activeClients),
      icon: UserCheck,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      description: "Phone verified clients",
    },
    {
      title: "Suspended Clients",
      value: stats.suspendedClients.toString(),
      percentage: calculatePercentage(stats.suspendedClients),
      icon: UserX,
      color: "bg-red-500",
      bgColor: "bg-red-50",
      textColor: "text-red-700",
      description: "Phone unverified clients",
    },
    {
      title: "New Today",
      value: stats.newClientsToday.toString(),
      percentage: calculatePercentage(
        stats.newClientsToday,
        Math.max(stats.totalClients, 10)
      ),
      icon: Clock,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
      description: "Registered today",
    },
    {
      title: "Avg Rating",
      value: stats.averageRating.toFixed(1),
      percentage: (stats.averageRating / 5) * 100,
      icon: Star,
      color: "bg-yellow-500",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-700",
      description: "Overall average (out of 5)",
    },
    {
      title: "With Completed Tasks",
      value: stats.clientsWithCompletedTasks.toString(),
      percentage: calculatePercentage(stats.clientsWithCompletedTasks),
      icon: CheckCircle,
      color: "bg-emerald-500",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
      description: "Clients with task history",
    },
    {
      title: "Growth Rate",
      value: "+8.2%",
      percentage: 82,
      icon: TrendingUp,
      color: "bg-indigo-500",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-700",
      description: "This month",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-6 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500">{stat.description}</p>
              </div>
              <div
                className={`p-3 rounded-lg ${stat.bgColor} ${stat.textColor}`}
              >
                <Icon className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500">Progress</span>
                <span className="text-xs font-medium text-gray-700">
                  {stat.percentage.toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${stat.color} transition-all duration-1000 ease-out`}
                  style={{
                    width: `${stat.percentage}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
