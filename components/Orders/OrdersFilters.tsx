"use client";

import { Search, Filter } from "lucide-react";
import { OrderStatus } from "@/types/order";

interface OrdersFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedStatus: OrderStatus | "all";
  onStatusChange: (status: OrderStatus | "all") => void;
  totalOrders: number;
  filteredCount: number;
  statusCounts?: {
    all: number;
    Pending: number;
    Expired: number;
    Declined: number;
    Accepted: number;
    Completed: number;
    Cancelled: number;
  };
}

const statusTabs = [
  { value: "all", label: "All Requests" },
  { value: "Pending", label: "Pending" },
  { value: "Expired", label: "Expired" },
  { value: "Declined", label: "Declined" },
  { value: "Accepted", label: "Accepted" },
  { value: "Completed", label: "Completed" },
  { value: "Cancelled", label: "Cancelled" },
];

export default function OrdersFilters({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  totalOrders,
  filteredCount,
  statusCounts,
}: OrdersFiltersProps) {
  // Calculate counts for each status tab
  const getStatusCount = (status: string) => {
    if (statusCounts) {
      return statusCounts[status as keyof typeof statusCounts] || 0;
    }

    // Fallback to using filteredCount for the selected status
    if (status === "all") {
      return totalOrders;
    }
    if (status === selectedStatus) {
      return filteredCount;
    }
    return 0;
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search requests..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full text-black pl-10 pr-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/30 transition-all"
        />
      </div>

      {/* Status Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {statusTabs.map((tab) => {
            const count = getStatusCount(tab.value);
            const isActive = selectedStatus === tab.value;

            return (
              <button
                key={tab.value}
                onClick={() => onStatusChange(tab.value as OrderStatus | "all")}
                className={`
                  whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    isActive
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                `}
              >
                {tab.label}
                <span
                  className={`
                    ml-2 py-0.5 px-2 rounded-full text-xs font-medium
                    ${
                      isActive
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-600"
                    }
                  `}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
