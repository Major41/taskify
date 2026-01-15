"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ApplicationsTable from "@/components/Applications/ApplicationsTable";
import ApplicationsFilters from "@/components/Applications/ApplicationsFilters";
import { useAuth } from "@/contexts/AuthContext";

interface Tasker {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  profile_url?: string;
  is_approved: boolean;
  isTasker: boolean;
  skills?: Array<{
    skill_name: string;
    experience_level: string;
  }>;
  category?: string;
  created_at: string;
  avatar_url?: string;
  status: string;
}

export default function ApplicationsPage() {
  const { token } = useAuth();
  const [applications, setApplications] = useState<Tasker[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Tasker[]>(
    []
  );
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
  const getApplicationStatus = (tasker: Tasker) => {
    return tasker.is_approved ? "approved" : "pending";
  };

  const loadApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://tasksfy.com/v1/web/admin/taskersWithReviews",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch applications");
      }

      const data = await response.json();
      console.log("Full API Response:", data); // Debug log

      if (data.success && data.taskersWithReviewsAndSkills) {
        // Transform the API response to match our Tasker interface
        const taskers = data.taskersWithReviewsAndSkills.map((item: any) => {
          const tasker = item.tasker;
          const user = tasker.user;

          console.log("tasker=",tasker)

          return {
            user_id: tasker.tasker_id,
            first_name: user?.first_name || "Unknown",
            last_name: user?.last_name || "User",
            email: user?.email || "No email",
            phone_number: user?.phone_number || "No phone",
            profile_url: user?.profile_url,
            is_approved: tasker.is_approved || false,
            isTasker: user?.isTasker || false,
            skills: item.skills || [],
            category: tasker.category || "General",
            created_at: tasker?.tasker_reg_date || new Date().toISOString(),
            avatar_url: user?.profile_url,
            status: tasker?.user?.tasker_application_status,
            about: tasker.tasker_about,
            idImages: {
              passport: tasker.passport_photo,
              id_front: tasker.id_card_front,
              id_back: tasker.id_card_back,
            },
            workImages: tasker.job_images,
          };
        });

        console.log("Transformed Applications:", taskers); // Debug log
        setApplications(taskers);
      } else {
        console.error("API response structure unexpected:", data);
        throw new Error(data.message || "Failed to load applications");
      }
    } catch (error) {
      console.error("Failed to load applications:", error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    // Filter by status - use is_approved field to determine status
    if (selectedStatus !== "all") {
      filtered = filtered.filter((tasker) => {
        const status = getApplicationStatus(tasker);
        return status === selectedStatus;
      });
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (tasker) =>
          tasker.first_name?.toLowerCase().includes(query) ||
          tasker.last_name?.toLowerCase().includes(query) ||
          tasker.phone_number?.toLowerCase().includes(query) ||
          tasker.email?.toLowerCase().includes(query) ||
          (tasker.skills &&
            tasker.skills.some(
              (skill) =>
                skill.skill_name &&
                skill.skill_name.toLowerCase().includes(query)
            )) ||
          (tasker.category && tasker.category.toLowerCase().includes(query))
      );
    }

    setFilteredApplications(filtered);
  };

  const handleApproveApplication = async (taskerId: string) => {
    try {
      const response = await fetch(
        `https://tasksfy.com/v1/web/admin/tasker/application/approval?tasker_id=${taskerId}&is_approved=true`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Approval response:", data);

        if (data.success) {
          // Refresh applications to get updated status
          await loadApplications();
          alert("Application approved successfully!");
        } else {
          throw new Error(data.message || "Failed to approve application");
        }
      } else {
        throw new Error("Failed to approve application");
      }
    } catch (error) {
      console.error("Failed to approve application:", error);
      alert("Failed to approve application. Please try again.");
    }
  };

  const handleRejectApplication = async (taskerId: string) => {
    if (!confirm("Are you sure you want to reject this application?")) return;

    try {
      const response = await fetch(
        `https://tasksfy.com/v1/web/admin/tasker/application/approval?tasker_id=${taskerId}&is_approved=false`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Rejection response:", data);

        if (data.success) {
          // Refresh applications to get updated status
          await loadApplications();
          alert("Application rejected successfully!");
        } else {
          throw new Error(data.message || "Failed to reject application");
        }
      } else {
        throw new Error("Failed to reject application");
      }
    } catch (error) {
      console.error("Failed to reject application:", error);
      alert("Failed to reject application. Please try again.");
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
              Showing {filteredApplications.length} of {applications.length}{" "}
              applications
              {selectedStatus !== "all" && ` (filtered by ${selectedStatus})`}
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

      {/* Empty State */}
      {filteredApplications.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No applications found
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {applications.length === 0
              ? "No tasker applications have been submitted yet. Applications will appear here once users apply to become taskers."
              : "No applications match your current filters. Try adjusting your search criteria."}
          </p>
          {(searchQuery || selectedStatus !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedStatus("all");
              }}
              className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Copyright Footer */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        Copyright Tasksfy Inc © 2025.
      </div>
    </div>
  );
}
