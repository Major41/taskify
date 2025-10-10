// components/Verification/VerificationStatsCards.tsx
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Handshake,
  PlayCircle,
  Ban,
} from "lucide-react";
import { VerificationStats } from "@/types/verification";

interface VerificationStatsCardsProps {
  stats: VerificationStats;
}

export default function VerificationStatsCards({
  stats,
}: VerificationStatsCardsProps) {
  const statCards = [
    {
      title: "Total Tasks",
      value: stats.totalVerifications?.toString(),
      icon: Users,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      description: "All accepted tasks",
    },
    {
      title: "In Negotiation",
      value: stats.inNegotiation?.toString(),
      icon: Handshake,
      color: "bg-yellow-500",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-700",
      description: "Pending verification",
    },
    {
      title: "Ongoing",
      value: stats.ongoing?.toString(),
      icon: PlayCircle,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
      description: "Tasks in progress",
    },
    {
      title: "Completed",
      value: stats.completed?.toString(),
      icon: CheckCircle,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      description: "Successfully completed",
    },
    {
      title: "Canceled",
      value: stats.canceled?.toString(),
      icon: Ban,
      color: "bg-red-500",
      bgColor: "bg-red-50",
      textColor: "text-red-700",
      description: "Tasks canceled",
    },
    {
      title: "Success Rate",
      value: `${Math.round(
        (stats.completed / stats.totalVerifications) * 100
      )}%`,
      icon: TrendingUp,
      color: "bg-emerald-500",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
      description: "Completion rate",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${stat.color}`}
                style={{
                  width: `${Math.min((index + 1) * 20, 100)}%`,
                }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
