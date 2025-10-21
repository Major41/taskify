// components/Layout/DashboardHeader.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Menu, Search, Bell, RefreshCw, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardHeaderProps {
  onMenuToggle: () => void;
}

export default function DashboardHeader({
  onMenuToggle,
}: DashboardHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const handleRefresh = () => {
    // Full page reload
    window.location.reload();
  };

  const currentUser =
    user ||
    JSON.parse(
      localStorage.getItem("tasksfyUser") ||
        '{"role":"Super Admin","name":"Admin User"}'
    );

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-30">
      <div className="flex items-center justify-between p-4">
        {/* Mobile: Profile on left side */}
        <div className="flex lg:hidden items-center space-x-3">
          <div className="relative">
            <Image
              src="/izoh.jpg"
              alt="Profile"
              width={40}
              height={40}
              className="rounded-full border-2 border-white shadow-sm"
            />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-900">
              {currentUser.first_name} {currentUser.last_name}
            </p>
            <p className="text-xs text-gray-500">{currentUser.role}</p>
          </div>
        </div>

        {/* Mobile menu button - moved to right side */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl bg-white shadow-sm border border-gray-200/60 hover:shadow-md transition-all"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>

        {/* Desktop layout */}
        <div className="hidden lg:flex flex-1 items-center justify-between lg:justify-end space-x-4">
          {/* System Status */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-200/60">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">
                System Operational
              </span>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center space-x-2">
            {/* Refresh */}
            <button
              onClick={handleRefresh}
              className="p-2.5 text-gray-600 hover:bg-gray-50 rounded-xl transition-all duration-200 hover:shadow-sm border border-transparent hover:border-gray-200/60"
              title="Refresh page"
            >
              <RefreshCw className="w-5 h-5" />
            </button>

            {/* Profile */}
            <div className="flex items-center space-x-3 pl-2">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {currentUser.first_name} {currentUser.last_name}
                </p>
                <p className="text-xs text-gray-500">{currentUser.role}</p>
              </div>
              <div className="relative">
                <Image
                  src="/izoh.jpg"
                  alt="Profile"
                  width={40}
                  height={40}
                  className="rounded-full border-2 border-white shadow-sm"
                />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar Expansion */}
      {isSearchOpen && (
        <div className="px-4 pb-4">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks, users, payments..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200/60 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500/50 transition-all"
              autoFocus
            />
            <button
              onClick={() => setIsSearchOpen(false)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
