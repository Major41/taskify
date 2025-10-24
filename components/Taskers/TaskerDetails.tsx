// components/Taskers/TaskerDetails.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Star,
  CheckCircle,
  XCircle,
  MapPin,
  Phone,
  Mail,
  Shield,
  Wallet,
  Loader2,
} from "lucide-react";
import { Tasker } from "@/types/tasker";
import { useAuth } from "@/contexts/AuthContext";

interface TaskerDetailsProps {
  tasker: Tasker;
}

interface TaskStats {
  status: string;
  count: number;
}

interface TaskStatsResponse {
  stats: TaskStats[];
}

export default function TaskerDetails({ tasker }: TaskerDetailsProps) {
  const { token } = useAuth();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loadingStats, setLoadingStats] = useState(true);
  const [taskStats, setTaskStats] = useState({
    pending: 0,
    expired: 0,
    declined: 0,
    inNegotiation: 0,
    ongoing: 0,
    canceled: 0,
    completed: 0,
  });

  useEffect(() => {
    if (tasker.id) {
      fetchTaskStats();
    }
  }, [tasker.id]);

  const fetchTaskStats = async () => {
    try {
      setLoadingStats(true);

      if (!token) {
        console.error("No authentication token found");
        return;
      }

      // Fetch negotiation status stats for tasker
      const negotiationResponse = await fetch(
        `https://tasksfy.com/v1/web/admin/tasker/requests/negotiation_status/stats?tasker_id=${tasker.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Fetch task status stats for tasker
      const taskStatusResponse = await fetch(
        `https://tasksfy.com/v1/web/admin/tasker/accepted/requests/task_status/stats?tasker_id=${tasker.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const negotiationData: TaskStatsResponse =
        await negotiationResponse.json();
        console.log("Negotiation Data:", negotiationData); // Debug log
      const taskStatusData: TaskStatsResponse = await taskStatusResponse.json();

      // Process negotiation stats
      const negotiationStats = negotiationData.stats || [];
      const pending =
        negotiationStats.find((s) => s.status === "Pending")?.count || 0;
      const expired =
        negotiationStats.find((s) => s.status === "Expired")?.count || 0;
      const declined =
        negotiationStats.find((s) => s.status === "Declined")?.count || 0;

      // Process task status stats
      const taskStats = taskStatusData.stats || [];
      const inNegotiation =
        taskStats.find((s) => s.status === "In Negotiation")?.count || 0;
      const ongoing = taskStats.find((s) => s.status === "Ongoing")?.count || 0;
      const canceled =
        taskStats.find((s) => s.status === "Canceled")?.count || 0;
      const completed =
        taskStats.find((s) => s.status === "Completed")?.count || 0;

      setTaskStats({
        pending,
        expired,
        declined,
        inNegotiation,
        ongoing,
        canceled,
        completed,
      });
    } catch (error) {
      console.error("Error fetching task stats:", error);
      setError("Failed to load task statistics");
    } finally {
      setLoadingStats(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      setError("Message cannot be empty");
      return;
    }

    setSending(true);
    setError("");

    try {
      if (!token) {
        setError("Authentication token not found");
        return;
      }

      // Use the new route format with query parameters
      const response = await fetch(
        `https://tasksfy.com/v1/web/admin/message/user/by/id/send?user_id=${
          tasker.id
        }&message=${encodeURIComponent(message.trim())}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          // No body needed since message is in URL parameters
        }
      );

      console.log("Message response:", response);

      // Handle response - first get as text to avoid JSON parsing errors
      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        data = { success: false, message: responseText };
      }

      if (response.ok) {
        setSent(true);
        setMessage("");
        setTimeout(() => setSent(false), 3000);
      } else {
        setError(data.message || "Failed to send message");
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "text-yellow-500 fill-current" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const getVerificationBadge = (status: string) => {
    const config = {
      Verified: { color: "bg-green-100 text-green-800", label: "Verified" },
      Pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      Unverified: { color: "bg-gray-100 text-gray-800", label: "Unverified" },
    };

    const currentConfig =
      config[status as keyof typeof config] || config.Unverified;

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${currentConfig.color}`}
      >
        {currentConfig.label}
      </span>
    );
  };

  if (loadingStats) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading task statistics...</span>
      </div>
    );
  }

  return (
    <div className="tasker-details-flex flex">
      <div className="tasker-details-left flex-1">
        <div className="about-info">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Profile Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">{tasker.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                {tasker.address || "No address provided"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                {tasker.phone}
                <span
                  className={`ml-2 ${
                    tasker.isPhone_number_verified
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  ({tasker.isPhone_number_verified ? "Verified" : "Unverified"})
                </span>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Wallet className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                Wallet: KES {tasker.walletBalance?.toLocaleString() || "0"}
              </span>
            </div>
          </div>

          <div className="tasker-rating flex items-center space-x-4 mb-6">
            <strong className="text-gray-900">Tasker Avg Rating:</strong>
            <span className="rating-value text-2xl font-bold text-yellow-600">
              {tasker.tasker_average_rating?.toFixed(1) || "0.0"}
            </span>
            <div className="rating-stars">
              {renderStars(Math.round(tasker.tasker_average_rating || 0))}
            </div>
          </div>

          {/* Verification Status */}
          <div className="verification-section mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">
              Verification Status
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Level 1</span>
                {getVerificationBadge(tasker.verification_level1_status)}
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Level 2</span>
                {getVerificationBadge(tasker.verification_level2_status)}
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Level 3</span>
                {getVerificationBadge(tasker.verification_level3_status)}
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Level 4</span>
                {getVerificationBadge(tasker.verification_level4_status)}
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Level 5</span>
                {getVerificationBadge(tasker.verification_level5_status)}
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Application</span>
                {getVerificationBadge(tasker.tasker_application_status)}
              </div>
            </div>
          </div>
        </div>

        <div className="tasker-stats grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="stat-box pending bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Pending Tasks</div>
            <div className="text-2xl font-bold text-gray-900">
              {taskStats.pending}
            </div>
          </div>
          <div className="stat-box negotiation bg-yellow-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">In Negotiation</div>
            <div className="text-2xl font-bold text-gray-900">
              {taskStats.inNegotiation}
            </div>
          </div>
          <div className="stat-box expired bg-orange-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Expired Tasks</div>
            <div className="text-2xl font-bold text-gray-900">
              {taskStats.expired}
            </div>
          </div>
          <div className="stat-box declined bg-red-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Declined Tasks</div>
            <div className="text-2xl font-bold text-gray-900">
              {taskStats.declined}
            </div>
          </div>
          <div className="stat-box completed bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Completed Tasks</div>
            <div className="text-2xl font-bold text-gray-900">
              {taskStats.completed}
            </div>
          </div>
          <div className="stat-box canceled bg-red-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Canceled Tasks</div>
            <div className="text-2xl font-bold text-gray-900">
              {taskStats.canceled}
            </div>
          </div>
          <div className="stat-box ongoing bg-purple-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Ongoing Tasks</div>
            <div className="text-2xl font-bold text-gray-900">
              {taskStats.ongoing}
            </div>
          </div>
        </div>

        <div className="profile-message-box">
          <label
            htmlFor="tasker-message"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            <strong>Compose a message to this Tasker</strong>
          </label>
          <textarea
            id="tasker-message"
            rows={3}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setError(""); // Clear error when user starts typing
            }}
            placeholder="I.e Hello John, We are writing to warn you that your account will be suspended if you continue declining clients' offers while online."
            className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-vertical"
          />

          {/* Error Message */}
          {error && (
            <div className="mt-2 text-red-600 text-sm flex items-center">
              <XCircle className="w-4 h-4 mr-1" />
              {error}
            </div>
          )}

          <div className="flex justify-between items-center mt-3">
            <div>
              {sent && (
                <span className="text-green-600 text-sm flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Message sent successfully!
                </span>
              )}
            </div>
            <button
              onClick={handleSendMessage}
              disabled={sending || !message.trim()}
              className="send-message-btn bg-green-600 text-white px-6 py-2 rounded-md font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? "Sending..." : "Send Message"}
            </button>
          </div>
        </div>
      </div>

      <div className="tasker-details-right bg-gray-50 p-6 rounded-lg flex-1">
        <div className="activity-title text-lg font-semibold text-gray-900 mb-4 text-center">
          Clients' Ratings and Reviews
        </div>

        <div className="activity-list space-y-4">
          {tasker.reviews && tasker.reviews.length > 0 ? (
            tasker.reviews.slice(0, 5).map((review) => (
              <div
                key={review.id}
                className="activity-item bg-white p-4 rounded-lg shadow-sm"
              >
                <div className="activity-date text-sm text-gray-500 mb-2">
                  {formatDate(review.feedbackDate)}
                </div>
                <div className="activity-text text-gray-700 mb-2">
                  {review.feedback}
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    - {review.senderFName} {review.senderLName}
                  </div>
                  <div className="flex items-center space-x-1">
                    {renderStars(review.feedbackRatingStar)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              <XCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No reviews yet</p>
            </div>
          )}
        </div>

        {tasker.reviews && tasker.reviews.length > 5 && (
          <div className="text-center mt-4">
            <button className="text-sm text-green-600 hover:text-green-700 font-medium">
              View all {tasker.reviews.length} reviews
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
