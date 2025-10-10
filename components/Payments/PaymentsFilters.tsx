"use client";

import { Search } from "lucide-react";

interface PaymentsFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalPayments: number;
}

export default function PaymentsFilters({
  searchQuery,
  onSearchChange,
  totalPayments,
}: PaymentsFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Search Bar Only */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search transactions..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full text-black pl-10 pr-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500/30 transition-all"
        />
      </div>

      {/* Total Count Display */}
      <div className="text-sm text-gray-600">
        Total transactions:{" "}
        <span className="font-semibold">{totalPayments}</span>
      </div>
    </div>
  );
}
