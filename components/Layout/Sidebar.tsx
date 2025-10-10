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
  Menu,
  X,
  Search,
  Bell,
  RefreshCw,
  LogOut,
  Crown,
  Settings,
  HelpCircle,
  BarChart3,
  FileText,
} from "lucide-react";

interface SidebarProps {
  children: React.ReactNode;
}

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/orders", label: "Task Orders", icon: ClipboardList },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/applications", label: "Applications", icon: FileText },
  { href: "/verification", label: "Verification", icon: ShieldCheck },
  { href: "/taskers", label: "Taskers", icon: Users },
  { href: "/clients", label: "Clients", icon: UserCheck },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ children }: SidebarProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("tasksfyUser");
    router.push("/");
  };

  const currentUser = JSON.parse(
    localStorage.getItem("tasksfyUser") ||
      '{"role":"Super Admin","name":"Admin User"}'
  );

  return (
    <div className="flex h-screen bg-gray-50/80 backdrop-blur-sm">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-80 bg-white/95 backdrop-blur-xl border-r border-gray-200/60
        transform transition-all duration-300 ease-in-out
        flex flex-col shadow-2xl shadow-green-900/5
        ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }
      `}
      >
        {/* Header Section */}
        <div className="p-6 border-b border-gray-200/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Image
                  src="/logo.jpeg"
                  alt="Tasksfy Logo"
                  width={44}
                  height={44}
                  className="rounded-xl shadow-lg shadow-green-500/20 border-2 border-white"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                  Tasksfy
                </h1>
                <p className="text-xs text-gray-500 font-medium">Admin Panel</p>
              </div>
            </div>

            {/* Close button for mobile */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="px-2 py-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Main Menu
            </h3>
            <div className="space-y-1">
              {menuItems.slice(0, 5).map((item) => {
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
                          ? "bg-green-50 border border-green-100 text-green-700 shadow-sm shadow-green-500/10"
                          : "text-gray-600 hover:bg-gray-50/80 hover:text-gray-900 border border-transparent"
                      }
                    `}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <Icon
                      className={`w-5 h-5 transition-colors ${
                        isActive
                          ? "text-green-600"
                          : "text-gray-400 group-hover:text-gray-600"
                      }`}
                    />
                    <span className="font-medium text-sm">{item.label}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="px-2 py-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Management
            </h3>
            <div className="space-y-1">
              {menuItems.slice(5, 8).map((item) => {
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
                          ? "bg-blue-50 border border-blue-100 text-blue-700 shadow-sm shadow-blue-500/10"
                          : "text-gray-600 hover:bg-gray-50/80 hover:text-gray-900 border border-transparent"
                      }
                    `}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <Icon
                      className={`w-5 h-5 transition-colors ${
                        isActive
                          ? "text-blue-600"
                          : "text-gray-400 group-hover:text-gray-600"
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
        <div className="p-4 border-t border-gray-200/60 bg-white/50 backdrop-blur-sm">
          {/* User Profile */}
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100/50 mb-4">
            <div className="relative">
              <Image
                src="/izoh.jpg"
                alt="Profile"
                width={40}
                height={40}
                className="rounded-lg border-2 border-white shadow-sm"
              />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {currentUser.name}
              </p>
              <div className="flex items-center space-x-1">
                <Crown className="w-3 h-3 text-amber-500" />
                <p className="text-xs text-gray-600 font-medium">
                  {currentUser.role}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <Link
              href="/admin-approval"
              className="flex items-center justify-center space-x-2 px-3 py-2 bg-amber-500/10 text-amber-700 rounded-lg hover:bg-amber-500/20 transition-all duration-200 group border border-amber-200/50"
            >
              <Crown className="w-4 h-4" />
              <span className="text-xs font-medium">Approve Admin</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center space-x-2 px-3 py-2 bg-red-500/10 text-red-700 rounded-lg hover:bg-red-500/20 transition-all duration-200 group border border-red-200/50"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-xs font-medium">Logout</span>
            </button>
          </div>

          {/* Help & Support */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <button className="flex items-center space-x-1 hover:text-gray-700 transition-colors">
              <HelpCircle className="w-3 h-3" />
              <span>Help</span>
            </button>
            <div className="text-gray-400">v2.1.0</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-30">
          <div className="flex items-center justify-between p-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 rounded-xl bg-white shadow-sm border border-gray-200/60 hover:shadow-md transition-all"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>

            <div className="flex-1 flex items-center justify-between lg:justify-end space-x-4">
              {/* System Status */}
              <div className="hidden lg:flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-200/60">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-700">
                    System Operational
                  </span>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center space-x-2">
                {/* Search */}
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="p-2.5 text-gray-600 hover:bg-gray-50 rounded-xl transition-all duration-200 hover:shadow-sm border border-transparent hover:border-gray-200/60"
                >
                  <Search className="w-5 h-5" />
                </button>

                {/* Refresh */}
                <button className="p-2.5 text-gray-600 hover:bg-gray-50 rounded-xl transition-all duration-200 hover:shadow-sm border border-transparent hover:border-gray-200/60">
                  <RefreshCw className="w-5 h-5" />
                </button>

                {/* Notifications */}
                <button className="p-2.5 text-gray-600 hover:bg-gray-50 rounded-xl transition-all duration-200 hover:shadow-sm border border-transparent hover:border-gray-200/60 relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                </button>

                {/* Profile */}
                <div className="flex items-center space-x-3 pl-2">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-gray-900">
                      {currentUser.name}
                    </p>
                    <p className="text-xs text-gray-500">{currentUser.role}</p>
                  </div>
                  <div className="relative">
                    <Image
                      src="/izoh.jpg"
                      alt="Profile"
                      width={40}
                      height={40}
                      className="rounded-xl border-2 border-white shadow-sm"
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

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gradient-to-br from-gray-50/50 to-white/30">
          {children}
        </main>
      </div>
    </div>
  );
}
