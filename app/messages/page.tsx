"use client";

import { useState, useEffect } from "react";
import {
  Send,
  Users,
  AlertCircle,
  CheckCircle,
  Loader2,
  MessageCircle,
  Trash2,
} from "lucide-react";

interface Message {
  _id: string;
  userId: string;
  userName: string;
  userType: "client" | "tasker";
  userAvatar?: string;
  message: string;
  direction: "admin_to_user" | "user_to_admin";
  read: boolean;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [generalMessage, setGeneralMessage] = useState(
    "Hello there, We wish you a merry Christmas and a happy New Year. Tasksfy values you and wishes you a blessed eve."
  );
  const [taskersMessage, setTaskersMessage] = useState(
    "Hello there, We wish you a merry Christmas and a happy New Year. Tasksfy values you and wishes you a blessed eve."
  );
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Fetch messages
  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/messages");
      const data = await response.json();

      if (data.success) setMessages(data.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
      showAlert("error", "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleGeneralBroadcast = async () => {
    if (!generalMessage.trim()) return;

    try {
      setSending(true);
      const response = await fetch("/api/admin/messages/broadcast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: generalMessage.trim(),
          userType: "all",
        }),
      });

      const data = await response.json();

      if (data.success) {
        showAlert(
          "success",
          `Message sent to all users (${data.data.sentCount} users)`
        );
        // Refresh messages to show the new broadcast
        fetchMessages();
      } else {
        showAlert("error", data.message);
      }
    } catch (error) {
      console.error("Error broadcasting message:", error);
      showAlert("error", "Failed to send message to all users");
    } finally {
      setSending(false);
    }
  };

  const handleTaskersBroadcast = async () => {
    if (!taskersMessage.trim()) return;

    try {
      setSending(true);
      const response = await fetch("/api/admin/messages/broadcast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: taskersMessage.trim(),
          userType: "taskers",
        }),
      });

      const data = await response.json();

      if (data.success) {
        showAlert(
          "success",
          `Message sent to all taskers (${data.data.sentCount} taskers)`
        );
        // Refresh messages to show the new broadcast
        fetchMessages();
      } else {
        showAlert("error", data.message);
      }
    } catch (error) {
      console.error("Error broadcasting to taskers:", error);
      showAlert("error", "Failed to send message to taskers");
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm("Are you sure you want to delete this message?")) {
      return;
    }

    try {
      setDeleting(messageId);
      const response = await fetch(`/api/admin/messages?id=${messageId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        // Remove the message from the local state
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
        showAlert("success", "Message deleted successfully");
      } else {
        showAlert("error", data.message);
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      showAlert("error", "Failed to delete message");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Alert */}
      {alert && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
            alert.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {alert.type === "success" ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{alert.message}</span>
        </div>
      )}

      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Messages and Updates
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Broadcast Messages */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Message to All Users */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Users className="h-5 w-5 text-gray-700" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Compose a general message to all Users
                </h3>
              </div>

              <div className="space-y-4">
                <textarea
                  className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={4}
                  placeholder="Type your message to all users..."
                  value={generalMessage}
                  onChange={(e) => setGeneralMessage(e.target.value)}
                />

                <div className="flex justify-end">
                  <button
                    onClick={handleGeneralBroadcast}
                    disabled={!generalMessage.trim() || sending}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    {sending ? "Sending..." : "Send Message"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Message to Taskers */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Users className="h-5 w-5 text-gray-700" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Compose a message to all Taskers
                </h3>
              </div>

              <div className="space-y-4">
                <textarea
                  className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={4}
                  placeholder="Type your message to all taskers..."
                  value={taskersMessage}
                  onChange={(e) => setTaskersMessage(e.target.value)}
                />

                <div className="flex justify-end">
                  <button
                    onClick={handleTaskersBroadcast}
                    disabled={!taskersMessage.trim() || sending}
                    className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    {sending ? "Sending..." : "Send Message"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Messages List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5 text-gray-700" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Messages
                </h2>
              </div>
            </div>

            <div className="max-h-[600px] overflow-y-auto">
              {messages.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {messages.map((message) => (
                    <div
                      key={message._id}
                      className="p-4 hover:bg-gray-50 transition-colors group relative"
                    >
                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteMessage(message._id)}
                        disabled={deleting === message._id}
                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                        title="Delete message"
                      >
                        {deleting === message._id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </button>

                      <div className="flex items-start space-x-3 pr-6">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {message.userName}
                            </p>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                message.userType === "tasker"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-purple-100 text-purple-800"
                              }`}
                            >
                              {message.userType}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {message.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(message.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {!message.read && (
                          <div className="flex-shrink-0">
                            <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-32 flex flex-col items-center justify-center text-gray-500">
                  <MessageCircle className="h-8 w-8 mb-2 text-gray-300" />
                  <p className="text-sm">No messages yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
