// components/Clients/ClientDetails.tsx
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
  Wallet,
  Loader2,
} from "lucide-react";
import { Client } from "@/types/client";
import { useAuth } from "@/contexts/AuthContext";

interface ClientDetailsProps {
  client: Client;
}

interface TaskStats {
  status: string;
  count: number;
}

interface TaskStatsResponse {
  stats: TaskStats[];
}

export default function ClientDetails({ client }: ClientDetailsProps) {
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
    if (client.id) {
      fetchTaskStats();
    }
  }, [client.id]);

  const fetchTaskStats = async () => {
    try {
      setLoadingStats(true);

      if (!token) {
        console.error("No authentication token found");
        return;
      }

      // Fetch negotiation status stats
      const negotiationResponse = await fetch(
        `https://tasksfy.com/v1/web/admin/user/requests/negotiation_status/stats?user_id=${client.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Fetch task status stats
      const taskStatusResponse = await fetch(
        `https://tasksfy.com/v1/web/admin/user/accepted/requests/task_status/stats?user_id=${client.id}`,
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
          client.id
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
              <span className="text-sm text-gray-700">{client.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                {client.address || "No address provided"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                {client.phone}
                <span
                  className={`ml-2 ${
                    client.isPhone_number_verified
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  ({client.isPhone_number_verified ? "Verified" : "Unverified"})
                </span>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Wallet className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                Wallet: KES {client.walletBalance?.toLocaleString() || "0"}
              </span>
            </div>
          </div>

          <div className="client-rating flex items-center space-x-4 mb-6">
            <strong className="text-gray-900">Client Avg Rating:</strong>
            <span className="rating-value text-2xl font-bold text-yellow-600">
              {client.client_average_rating?.toFixed(1)}
            </span>
            <div className="rating-stars">
              {renderStars(Math.round(client.client_average_rating))}
            </div>
          </div>

          <div className="completed-tasks mb-6">
            <h4 className="font-semibold text-gray-900 mb-2">Task History</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-900">
                  {client.client_complete_tasks || 0}
                </div>
                <div className="text-sm text-blue-700">Tasks Completed</div>
              </div>
            </div>
          </div>
        </div>

        <div className="client-stats grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
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
            htmlFor="client-message"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            <strong>Compose a message to this Client</strong>
          </label>
          <textarea
            id="client-message"
            rows={3}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setError(""); // Clear error when user starts typing
            }}
            placeholder="I.e Hello, We are writing to inform you about important updates to our service terms..."
            className="w-full px-3 text-black py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-vertical"
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
          Taskers' Ratings and Reviews
        </div>

        <div className="activity-list space-y-4 ">
          {client.reviews && client.reviews.length > 0 ? (
            client.reviews.slice(0, 5).map((review) => (
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
                    - {review.senderFName}
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

        {client.reviews && client.reviews.length > 5 && (
          <div className="text-center mt-4">
            <button className="text-sm text-green-600 hover:text-green-700 font-medium">
              View all {client.reviews.length} reviews
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
