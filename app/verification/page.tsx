"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import VerificationTable from "@/components/Verification/VerificationTable";
import VerificationFilters from "@/components/Verification/VerificationFilters";

export default function VerificationPage() {
  const [verifications, setVerifications] = useState([]);
  const [filteredVerifications, setFilteredVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const searchParams = useSearchParams();

  useEffect(() => {
    loadVerifications();
  }, []);

  useEffect(() => {
    // Handle URL filter parameters
    const filter = searchParams.get("filter");
    if (
      filter &&
      (filter === "all" || ["pending", "approved"].includes(filter))
    ) {
      setSelectedStatus(filter);
    }
  }, [searchParams]);

  useEffect(() => {
    filterVerifications();
  }, [verifications, searchQuery, selectedStatus]);

  const loadVerifications = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/verifications");

      if (!response.ok) {
        throw new Error("Failed to fetch verification requests");
      }

      const data = await response.json();

      if (data.success) {
        setVerifications(data.data);
      } else {
        throw new Error(data.message || "Failed to load verification requests");
      }
    } catch (error) {
      console.error("Failed to load verification requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterVerifications = () => {
    let filtered = verifications;

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter(
        (verification) => verification.overallStatus === selectedStatus
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (verification) =>
          verification.tasker.name.toLowerCase().includes(query) ||
          verification.tasker.phone.toLowerCase().includes(query) ||
          verification.tasker.email.toLowerCase().includes(query)
      );
    }

    setFilteredVerifications(filtered);
  };

  const handleStageApproval = async (taskerId, stage) => {
    try {
      const response = await fetch("/api/admin/verifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskerId,
          stage,
        }),
      });

      if (response.ok) {
        // Refresh verifications
        await loadVerifications();
      } else {
        const errorData = await response.json();
        console.error("Failed to approve stage:", errorData.message);
      }
    } catch (error) {
      console.error("Failed to approve stage:", error);
    }
  };

  const handleFinalVerification = async (taskerId, approve) => {
    if (approve) {
      // Approve stage 5 (final verification)
      await handleStageApproval(taskerId, "stage5");
    } else {
      // For rejection, you might want to create a separate API endpoint
      const reason = prompt("Please provide a reason for rejection:");
      if (reason) {
        console.log("Rejecting tasker:", taskerId, "Reason:", reason);
        // You would call a reject API here
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">
              Loading verification requests...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Taskers Verification Requests
            </h1>
            <p className="text-gray-600 mt-1">
              {filteredVerifications.length} verification requests found
            </p>
          </div>

          <div className="mt-4 lg:mt-0">
            <VerificationFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              totalVerifications={verifications.length}
              filteredCount={filteredVerifications.length}
            />
          </div>
        </div>
      </div>

      {/* Verification Table */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200/60 overflow-hidden">
        <VerificationTable
          verifications={filteredVerifications}
          onStageApproval={handleStageApproval}
          onFinalVerification={handleFinalVerification}
        />
      </div>

      {/* Copyright Footer */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        Copyright Tasksfy Inc © 2025.
      </div>
    </div>
  );
}
