import { Users, Clock, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import { ApplicationStats } from "@/types/application";

interface ApplicationStatsCardsProps {
  stats: ApplicationStats;
}

export default function ApplicationStatsCards({
  stats,
}: ApplicationStatsCardsProps) {
  const statCards = [
    {
      title: "Total Applications",
      value: stats.totalApplications.toString(),
      icon: Users,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      description: "All time applications",
    },
    {
      title: "Pending Review",
      value: stats.pendingApplications.toString(),
      icon: Clock,
      color: "bg-yellow-500",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-700",
      description: "Awaiting approval",
    },
    {
      title: "Approved",
      value: stats.approvedApplications.toString(),
      icon: CheckCircle,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      description: "Successful applications",
    },
    {
      title: "Rejected",
      value: stats.rejectedApplications.toString(),
      icon: XCircle,
      color: "bg-red-500",
      bgColor: "bg-red-50",
      textColor: "text-red-700",
      description: "Unsuccessful applications",
    },
    {
      title: "Approval Rate",
      value: `${stats.approvalRate}%`,
      icon: TrendingUp,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
      description: "Success rate",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
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
                  width: `${
                    index === 4
                      ? stats.approvalRate
                      : Math.min((index + 1) * 20, 100)
                  }%`,
                }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
