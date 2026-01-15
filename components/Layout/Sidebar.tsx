// components/Layout/Sidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  ClipboardList,
  CreditCard,
  Users,
  UserCheck,
  ShieldCheck,
  MessageSquare,
  X,
  LogOut,
  Crown,
  FileText,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/orders", label: "Task Orders", icon: ClipboardList },
  {
    href: "/withdrawals",
    label: "Payments Request",
    icon: CreditCard,
    adminOnly: true,
  },
  { href: "/records", label: "Mpesa Records", icon: FileText },
  { href: "/applications", label: "Application Request", icon: FileText },
  { href: "/verification", label: "Verification Request", icon: ShieldCheck },
  { href: "/taskers", label: "Taskers", icon: Users },
  { href: "/clients", label: "Clients", icon: UserCheck },
  {
    href: "/messages",
    label: "Messages",
    icon: MessageSquare,
    adminOnly: true,
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}




export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("https://tasksfy.com/admin_dashboard");
  };

  const currentUser = user || {
    first_name: "Admin",
    last_name: "User",
    role: "ADMIN",
  };

  // Filter menu items based on user role
  const filteredMenuItems = (items: typeof menuItems) => {
    return items.filter((item) => {
      if (item.adminOnly) {
        return user?.role === "SUPER ADMIN";
      }
      return true;
    });
  };

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-80 bg-white/95 backdrop-blur-xl border-r border-gray-200/60
          transform transition-all duration-300 ease-in-out
          flex flex-col shadow-2xl shadow-green-900/5
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Header Section */}
        <div className="p-4 border-b bg-[#05A243]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Image
                  src="https://tasksfy.com/admin dashboard/logo.png"
                  alt="Tasksfy Logo"
                  width={40}
                  height={40}
                  className=""
                />
                {/* <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div> */}
              </div>
              <div>
                <h1 className="text-xl font-bold text-white bg-clip-text">
                  Tasksfy
                </h1>
                <p className="text-xs text-white font-medium">Admin Panel</p>
              </div>
            </div>

            {/* Close button for mobile */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 bg-[#05A243] overflow-y-auto">
          <div className="px-2 py-3">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Main Menu
            </h3>
            <div className="space-y-1">
              {filteredMenuItems(menuItems.slice(0, 6)).map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                      ${
                        isActive
                          ? "bg-orange-400 border border-green-100 text-white shadow-sm shadow-green-500/10"
                          : "text-text-white hover:bg-gray-50/80 hover:text-gray-900 border border-transparent"
                      }
                    `}
                    onClick={onClose}
                  >
                    <Icon
                      className={`w-5 h-5 transition-colors ${
                        isActive
                          ? "text-white"
                          : "text-white group-hover:text-gray-600"
                      }`}
                    />
                    <span className="font-medium text-sm">{item.label}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-[#05A243] rounded-full"></div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="px-2 py-3">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              Management
            </h3>
            <div className="space-y-1">
              {filteredMenuItems(menuItems.slice(6)).map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                      ${
                        isActive
                          ? "bg-orange-400 border border-blue-100 text-white shadow-sm shadow-blue-500/10"
                          : "text-white hover:bg-gray-50/80 hover:text-gray-900 border border-transparent"
                      }
                    `}
                    onClick={onClose}
                  >
                    <Icon
                      className={`w-5 h-5 transition-colors ${
                        isActive
                          ? "text-white"
                          : "text-white group-hover:text-gray-600"
                      }`}
                    />
                    <span className="font-medium text-sm">{item.label}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Footer Section */}
        <div className="p-2 border-t border-gray-200/60 bg-[#05A243] backdrop-blur-sm">
          <div className="grid grid-cols-2 gap-2 mb-2">
            {user?.role === "SUPER ADMIN" && (
              <Link
                href="/admin-approval"
                className="flex items-center justify-center space-x-2 px-3 py-2 bg-white text-amber-700 rounded-lg hover:bg-amber-500/20 transition-all duration-200 group border border-amber-200/50"
                onClick={onClose}
              >
                <Crown className="w-4 h-4" />
                <span className="text-xs font-medium">Approve Admin</span>
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center justify-center space-x-2 px-3 py-2 bg-white text-red-700 rounded-lg hover:bg-red-500/20 transition-all duration-200 group border border-red-200/50"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-xs font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
