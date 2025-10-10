// components/Taskers/TaskerStatsCards.tsx - Enhanced Version
import {
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  Star,
  Clock,
  Shield,
  AlertCircle,
} from "lucide-react";
import { TaskerStats } from "@/types/tasker";

interface TaskerStatsCardsProps {
  stats: TaskerStats;
}

export default function TaskerStatsCards({ stats }: TaskerStatsCardsProps) {
  // Different calculation methods for different stats
  const calculatePercentage = {
    // For counts relative to total taskers
    count: (value: number) => {
      if (stats.totalTaskers === 0) return 0;
      return Math.min((value / stats.totalTaskers) * 100, 100);
    },

    // For rating (0-5 scale to percentage)
    rating: (value: number) => (value / 5) * 100,

    // For daily registrations (relative to reasonable max)
    daily: (value: number) => Math.min((value / 20) * 100, 100), // Assuming 20 is a high daily registration
  };

  const statCards = [
    {
      title: "Total Taskers",
      value: stats.totalTaskers.toString(),
      percentage: 100,
      calculation: "total",
      icon: Users,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      description: "All registered taskers",
    },
    {
      title: "Active Taskers",
      value: stats.activeTaskers.toString(),
      percentage: calculatePercentage.count(stats.activeTaskers),
      calculation: "count",
      icon: UserCheck,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      description: `${(
        (stats.activeTaskers / stats.totalTaskers) * 100 || 0
      ).toFixed(1)}% of total`,
    },
    {
      title: "Suspended Taskers",
      value: stats.suspendedTaskers.toString(),
      percentage: calculatePercentage.count(stats.suspendedTaskers),
      calculation: "count",
      icon: UserX,
      color: "bg-red-500",
      bgColor: "bg-red-50",
      textColor: "text-red-700",
      description: `${(
        (stats.suspendedTaskers / stats.totalTaskers) * 100 || 0
      ).toFixed(1)}% of total`,
    },
    {
      title: "New Today",
      value: stats.newTaskersToday.toString(),
      percentage: calculatePercentage.daily(stats.newTaskersToday),
      calculation: "daily",
      icon: Clock,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
      description: "Registered today",
    },
    {
      title: "Avg Rating",
      value: stats.averageRating.toFixed(1),
      percentage: calculatePercentage.rating(stats.averageRating),
      calculation: "rating",
      icon: Star,
      color: "bg-yellow-500",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-700",
      description: `${stats.averageRating.toFixed(1)} out of 5 stars`,
    },
    {
      title: "Verified Taskers",
      value: stats.verifiedTaskers.toString(),
      percentage: calculatePercentage.count(stats.verifiedTaskers),
      calculation: "count",
      icon: Shield,
      color: "bg-emerald-500",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
      description: `${(
        (stats.verifiedTaskers / stats.totalTaskers) * 100 || 0
      ).toFixed(1)}% of total`,
    },
    {
      title: "Pending Verification",
      value: stats.pendingVerification.toString(),
      percentage: calculatePercentage.count(stats.pendingVerification),
      calculation: "count",
      icon: AlertCircle,
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
      textColor: "text-orange-700",
      description: `${(
        (stats.pendingVerification / stats.totalTaskers) * 100 || 0
      ).toFixed(1)}% of total`,
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
