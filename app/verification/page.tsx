"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import VerificationTable from "@/components/Verification/VerificationTable";
import VerificationFilters from "@/components/Verification/VerificationFilters";
import { useAuth } from "@/contexts/AuthContext";


export default function VerificationPage() {
  const { user, token } = useAuth();
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
      const response = await fetch(
        "https://tasksfy.com/v1/web/admin/users/with/verification/referrals",
        {          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch verification requests");
      }

      const data = await response.json();
      console.log("API Response:", data);

      if (Array.isArray(data)) {
        // Transform the API data to match our component structure
        const transformedData = data.map((item) => ({
          _id: item.user.user_id,
          tasker: {
            _id: item.user.user_id,
            name: `${item.user.first_name} ${item.user.last_name}`,
            phone: item.user.phone_number,
            email: item.user.email,
            avatar_url: item.user.profile_url,
            isTasker: item.user.isTasker,
            tasker_application_status: item.user.tasker_application_status,
          },
          verificationReferral: item.verificationReferral,
          verification_stages: {
            stage3: item.user.verification_level3_status,
            stage4: item.user.verification_level4_status,
            stage5: item.user.verification_level5_status,
          },
          overallStatus: getOverallStatus(item.user),
          appliedAt: item.user.dateOfVerificationApplicationRequest,
          // Add identification images
          identification_images: {
            passport: item.user.verified_identity_url,
            id_front: null, // Not provided in API
            id_back: null, // Not provided in API
          },
          // Add good conduct image
          good_conduct_image: item.verificationReferral?.goodConduct,
        }));

        setVerifications(transformedData);
      } else {
        throw new Error("Invalid data format received from API");
      }
    } catch (error) {
      console.error("Failed to load verification requests:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to determine overall status
  const getOverallStatus = (user) => {
    if (user.verification_level5_status === "Verified") {
      return "approved";
    } else if (
      user.verification_level3_status === "Pending" ||
      user.verification_level4_status === "Pending" ||
      user.verification_level5_status === "Pending"
    ) {
      return "pending";
    }
    return "pending"; // default
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
    let apiUrl = "";
    const adminName = user?.first_name;

    if (!token) {
      throw new Error("Authentication token not found");
    }

    // Determine which API endpoint to use based on the stage
    switch (stage) {
      case "stage3":
        apiUrl = `https://tasksfy.com/v1/web/admin/tasker/level3/approval?tasker_id=${taskerId}&status=Verified`;
        break;
      case "stage4":
        apiUrl = `https://tasksfy.com/v1/web/admin/tasker/level4/approval?tasker_id=${taskerId}&status=Verified`;
        break;
      case "stage5":
        apiUrl = `https://tasksfy.com/v1/web/admin/tasker/level5/approval?tasker_id=${taskerId}&status=Verified&admin_name=${encodeURIComponent(
          adminName
        )}`;
        break;
      default:
        throw new Error("Invalid verification stage");
    }

    console.log(`Approving ${stage} for tasker:`, taskerId);
    console.log("API URL:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    // First, check if the response is OK
    if (response.ok) {
      // Try to parse as JSON, but fallback to text if it fails
      let result;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        result = await response.json();
      } else {
        result = await response.text();
      }

      console.log(`Successfully approved ${stage}:`, result);

      // Refresh verifications to get updated status
      await loadVerifications();

      // Show success message
      alert(`Successfully verified ${stage} for the tasker!`);
    } else {
      // Handle non-OK responses
      const errorText = await response.text();
      console.error(`Failed to approve ${stage}:`, errorText);

      // Check if it's an authentication error
      if (response.status === 401) {
        alert("Authentication failed. Please log in again.");
      } else {
        alert(`Failed to verify ${stage}. Please try again.`);
      }
    }
  } catch (error) {
    console.error(`Failed to approve ${stage}:`, error);
    alert(`Error verifying ${stage}: ${error.message}`);
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
        // Example: handleStageRejection(taskerId, "stage5", reason);
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
