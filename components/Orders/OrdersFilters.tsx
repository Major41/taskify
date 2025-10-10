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
}

const statusTabs = [
  { value: "all", label: "All Orders", count: 0 },
  { value: "pending", label: "Pending", count: 0 },
  { value: "expired", label: "Expired", count: 0 },
  { value: "negotiation", label: "In Negotiation", count: 0 },
  { value: "ongoing", label: "Ongoing", count: 0 },
  { value: "cancelled", label: "Cancelled", count: 0 },
  { value: "completed", label: "Completed", count: 0 },
];

export default function OrdersFilters({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  totalOrders,
  filteredCount,
}: OrdersFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search orders..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/30 transition-all"
        />
      </div>

      {/* Status Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => onStatusChange(tab.value as OrderStatus | "all")}
              className={`
                whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  selectedStatus === tab.value
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
            >
              {tab.label}
              {tab.value === "all" && (
                <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                  {totalOrders}
                </span>
              )}
              {tab.value !== "all" && selectedStatus === tab.value && (
                <span className="ml-2 bg-green-100 text-green-600 py-0.5 px-2 rounded-full text-xs">
                  {filteredCount}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
