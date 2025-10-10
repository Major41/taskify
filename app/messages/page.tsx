"use client";

import { useState, useEffect } from "react";
import {
  Send,
  Users,
  User,
  MessageCircle,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  avatar_url?: string;
  userType: "client" | "tasker";
  phone_number?: string;
}

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
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastType, setBroadcastType] = useState<
    "all" | "clients" | "taskers"
  >("all");
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Fetch users and messages
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersResponse, messagesResponse] = await Promise.all([
        fetch("/api/admin/messages/users"),
        fetch("/api/admin/messages"),
      ]);

      const usersData = await usersResponse.json();
      const messagesData = await messagesResponse.json();

      if (usersData.success) setUsers(usersData.data);
      if (messagesData.success) setMessages(messagesData.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      showAlert("error", "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleSendMessage = async () => {
    if (!selectedUser || !newMessage.trim()) return;

    try {
      setSending(true);
      const response = await fetch("/api/admin/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUser._id,
          message: newMessage.trim(),
          userType: selectedUser.userType,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNewMessage("");
        setMessages((prev) => [data.data, ...prev]);
        showAlert("success", "Message sent successfully");
      } else {
        showAlert("error", data.message);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      showAlert("error", "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleBroadcastMessage = async () => {
    if (!broadcastMessage.trim()) return;

    try {
      setSending(true);
      const response = await fetch("/api/admin/messages/broadcast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: broadcastMessage.trim(),
          userType: broadcastType,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setBroadcastMessage("");
        showAlert(
          "success",
          `Message broadcasted to ${data.data.sentCount} users`
        );
      } else {
        showAlert("error", data.message);
      }
    } catch (error) {
      console.error("Error broadcasting message:", error);
      showAlert("error", "Failed to broadcast message");
    } finally {
      setSending(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    if (activeTab === 1) return user.userType === "client";
    if (activeTab === 2) return user.userType === "tasker";
    return true;
  });

  const userMessages = selectedUser
    ? messages.filter((msg) => msg.userId === selectedUser._id)
    : [];

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

      <h1 className="text-3xl font-bold text-gray-900 mb-6">Messages</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Users List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Users ({filteredUsers.length})
              </h2>

              {/* Tabs */}
              <div className="flex space-x-1 mt-4 bg-gray-100 rounded-lg p-1">
                {["All", "Clients", "Taskers"].map((tab, index) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(index)}
                    className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                      activeTab === index
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Users List */}
            <div className="max-h-[500px] overflow-y-auto">
              {filteredUsers.map((user) => (
                <div
                  key={user._id}
                  className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedUser?._id === user._id
                      ? "bg-blue-50 border-blue-200"
                      : ""
                  }`}
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.name}
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {user.email}
                      </p>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                          user.userType === "tasker"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {user.userType}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedUser
                  ? `Chat with ${selectedUser.name}`
                  : "Select a user to start chatting"}
              </h2>
            </div>

            {selectedUser ? (
              <>
                {/* Messages */}
                <div className="h-96 overflow-y-auto p-4 space-y-4">
                  {userMessages.map((message) => (
                    <div
                      key={message._id}
                      className={`flex ${
                        message.direction === "admin_to_user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.direction === "admin_to_user"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.direction === "admin_to_user"
                              ? "text-blue-100"
                              : "text-gray-500"
                          }`}
                        >
                          {new Date(message.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <textarea
                    className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={3}
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sending}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      {sending ? "Sending..." : "Send"}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-96 flex flex-col items-center justify-center text-gray-500">
                <MessageCircle className="h-16 w-16 mb-4 text-gray-300" />
                <p className="text-lg font-medium">
                  Select a user to start messaging
                </p>
              </div>
            )}
          </div>

          {/* Broadcast Message */}
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Users className="h-5 w-5 text-gray-700" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Broadcast Message
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Send a message to all users, clients only, or taskers only
              </p>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-3">
                  <label
                    htmlFor="broadcast-type"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Send to
                  </label>
                  <select
                    id="broadcast-type"
                    value={broadcastType}
                    onChange={(e) => setBroadcastType(e.target.value as "all" | "clients" | "taskers")}
                    className="w-full px-3 text-black py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Users</option>
                    <option value="clients">Clients Only</option>
                    <option value="taskers">Taskers Only</option>
                  </select>
                </div>

                <div className="md:col-span-7">
                  <label
                    htmlFor="broadcast-message"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Message
                  </label>
                  <textarea
                    id="broadcast-message"
                    className="w-full text-black px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={2}
                    placeholder="Type your broadcast message..."
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                  />
                </div>

                <div className="md:col-span-2">
                  <button
                    onClick={handleBroadcastMessage}
                    disabled={!broadcastMessage.trim() || sending}
                    className="w-full inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors h-[42px]"
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    <span className="ml-2 hidden sm:inline">
                      {sending ? "Sending..." : "Broadcast"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
