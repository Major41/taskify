// app/dashboard/layout.tsx
"use client";

import { useState } from "react";
import ProtectedLayout from "@/components/Layout/ProtectedLayout";
import Sidebar from "@/components/Layout/Sidebar";
import DashboardHeader from "@/components/Layout/DashboardHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <ProtectedLayout>
      <div className="flex h-screen bg-gray-50/80 backdrop-blur-sm">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <DashboardHeader
            onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          />

          {/* Page Content */}
          <main className="flex-1 overflow-auto bg-gradient-to-br from-gray-50/50 to-white/30">
            {children}
          </main>
        </div>
      </div>
    </ProtectedLayout>
  );
}
