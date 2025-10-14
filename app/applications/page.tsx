"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ApplicationsTable from "@/components/Applications/ApplicationsTable";
import ApplicationsFilters from "@/components/Applications/ApplicationsFilters";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const searchParams = useSearchParams();

  useEffect(() => {
    loadApplications();
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
    filterApplications();
  }, [applications, searchQuery, selectedStatus]);

  // Helper function to get status from is_approved field
  const getApplicationStatus = (application) => {
    console.log("Application is_approved:", application);
    return application.is_approved ? "approved" : "pending";
  };

  const loadApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/applications");

      if (!response.ok) {
        throw new Error("Failed to fetch applications");
      }

      const data = await response.json();

      if (data.success) {
        setApplications(data.data);
      } else {
        throw new Error(data.message || "Failed to load applications");
      }
    } catch (error) {
      console.error("Failed to load applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    // Filter by status - use is_approved field to determine status
    if (selectedStatus !== "all") {
      filtered = filtered.filter((application) => {
        const status = getApplicationStatus(application);
        return status === selectedStatus;
      });
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (application) =>
          application.user?.name?.toLowerCase().includes(query) ||
          application.user?.phone?.toLowerCase().includes(query) ||
          application.user?.email?.toLowerCase().includes(query) ||
          (application.skills &&
            application.skills.some(
              (skill) =>
                skill.skill_name &&
                skill.skill_name.toLowerCase().includes(query)
            )) ||
          (application.category &&
            application.category.toLowerCase().includes(query))
      );
    }

    setFilteredApplications(filtered);
  };

  const handleApproveApplication = async (applicationId: string) => {
    try {
      const response = await fetch("/api/admin/applications/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId,
        }),
      });

      if (response.ok) {
        // Refresh applications
        await loadApplications();
      }
    } catch (error) {
      console.error("Failed to approve application:", error);
    }
  };

  const handleRejectApplication = async (
    applicationId: string,
    reason?: string
  ) => {
    if (!confirm("Are you sure you want to reject this application?")) return;

    try {
      const response = await fetch("/api/admin/applications/reject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId,
          reason,
        }),
      });

      if (response.ok) {
        // Refresh applications
        await loadApplications();
      }
    } catch (error) {
      console.error("Failed to reject application:", error);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading applications...</p>
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
              Tasker Application Requests
            </h1>
            <p className="text-gray-600 mt-1">
              {filteredApplications.length} applications found
            </p>
          </div>

          <div className="mt-4 lg:mt-0">
            <ApplicationsFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              totalApplications={applications.length}
              filteredCount={filteredApplications.length}
            />
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200/60 overflow-hidden">
        <ApplicationsTable
          applications={filteredApplications}
          onApproveApplication={handleApproveApplication}
          onRejectApplication={handleRejectApplication}
        />
      </div>

      {/* Copyright Footer */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        Copyright Tasksfy Inc © 2025.
      </div>
    </div>
  );
}
