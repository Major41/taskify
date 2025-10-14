// components/Taskers/TaskerDetails.tsx
"use client";

import { useState } from "react";
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
} from "lucide-react";
import { Tasker } from "@/types/tasker";

interface TaskerDetailsProps {
  tasker: Tasker;
}

export default function TaskerDetails({ tasker }: TaskerDetailsProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSendMessage = async () => {
    if (!message.trim()) {
      setError("Message cannot be empty");
      return;
    }

    setSending(true);
    setError("");

    try {
      const response = await fetch("/api/admin/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: tasker._id,
          message: message.trim(),
          userType: "tasker", // Since this is a tasker details page
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSent(true);
        setMessage("");
        setTimeout(() => setSent(false), 3000);
      } else {
        setError(result.message || "Failed to send message");
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

  return (
    <div className="tasker-details-flex flex">
      <div className="tasker-details-left">
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
              {tasker.pendingTasks || 0}
            </div>
          </div>
          <div className="stat-box negotiation bg-yellow-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">In Negotiation</div>
            <div className="text-2xl font-bold text-gray-900">
              {tasker.inNegotiation || 0}
            </div>
          </div>
          <div className="stat-box cancelled bg-red-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Expired Tasks</div>
            <div className="text-2xl font-bold text-gray-900">
              {tasker.expiredTasks || 0}
            </div>
          </div>
          <div className="stat-box completed bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Completed Tasks</div>
            <div className="text-2xl font-bold text-gray-900">
              {tasker.completedTasks || 0}
            </div>
          </div>
          <div className="stat-box cancelled bg-orange-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Canceled Tasks</div>
            <div className="text-2xl font-bold text-gray-900">
              {tasker.cancelledTasks || 0}
            </div>
          </div>
          <div className="stat-box ongoing bg-purple-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Ongoing Tasks</div>
            <div className="text-2xl font-bold text-gray-900">
              {tasker.ongoingTasks || 0}
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

      <div className="tasker-details-right bg-gray-50 p-6 rounded-lg">
        <div className="activity-title text-lg font-semibold text-gray-900 mb-4 text-center">
          Clients' Ratings and Reviews
        </div>

        <div className="activity-list space-y-4">
          {tasker.reviews && tasker.reviews.length > 0 ? (
            tasker.reviews.slice(0, 5).map((review) => (
              <div
                key={review._id}
                className="activity-item bg-white p-4 rounded-lg shadow-sm"
              >
                <div className="activity-date text-sm text-gray-500 mb-2">
                  {formatDate(review.createdAt)}
                </div>
                <div className="activity-text text-gray-700 mb-2">
                  {review.comment}
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">- {review.client}</div>
                  <div className="flex items-center space-x-1">
                    {renderStars(review.rating)}
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
