// components/Payments/PaymentStatsCards.tsx
import { DollarSign, TrendingUp } from "lucide-react";
import { PaymentStats } from "@/types/payment";

interface PaymentStatsCardsProps {
  stats: PaymentStats;
}

export default function PaymentStatsCards({ stats }: PaymentStatsCardsProps) {
  const statCards = [
    {
      title: "Total Revenue",
      value: `KES ${stats?.totalRevenue?.toLocaleString() || "0"}`,
      icon: DollarSign,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      description: "All completed transactions",
      trend: "up" as const,
    },
    {
      title: "Revenue Growth",
      value: "+12.5%",
      icon: TrendingUp,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      description: "Compared to last month",
      trend: "up" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-6 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-2">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </p>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-gray-500">{stat.description}</p>
                  {stat.trend === "up" && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ↑ Trending
                    </span>
                  )}
                </div>
              </div>
              <div
                className={`p-4 rounded-xl ${stat.bgColor} ${stat.textColor}`}
              >
                <Icon className="w-8 h-8" />
              </div>
            </div>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${stat.color} transition-all duration-1000`}
                style={{
                  width: index === 0 ? "85%" : "65%",
                }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
