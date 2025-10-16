// components/Clients/ClientsTable.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import {
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
  Calendar,
  MessageCircle,
  Star,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { Client } from "@/types/client";
import ClientDetails from "./ClientDetails";
import SuspendModal from "./SuspendModal";

interface ClientsTableProps {
  clients: Client[];
  onSuspendClient: (clientId: string, reason: string) => void;
  onReinstateClient: (clientId: string) => void;
  onSendMessage: (clientId: string, message: string) => Promise<boolean>;
}

export default function ClientsTable({
  clients,
  onSuspendClient,
  onReinstateClient,
  onSendMessage,
}: ClientsTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const toggleDropdown = (clientId: string) => {
    setActiveDropdown(activeDropdown === clientId ? null : clientId);
  };

  const toggleRowExpansion = (clientId: string) => {
    setExpandedRow(expandedRow === clientId ? null : clientId);
  };

  const getStatusBadge = (client: Client) => {
    const isActive = client.is_approved;

    if (isActive) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Active
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Suspended
        </span>
      );
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const getDateApproved = (client: Client) => {
    if (client.is_approved) {
      return client.updatedAt ? formatDate(client.updatedAt) : "Approved";
    }
    return "Not Approved";
  };

  const handleSuspendClick = (client: Client) => {
    setSelectedClient(client);
    setShowSuspendModal(true);
  };

  const handleSuspendConfirm = async (reason: string) => {
    if (selectedClient) {
      await onSuspendClient(selectedClient._id, reason);
      setShowSuspendModal(false);
      setSelectedClient(null);
    }
  };

  const handleReinstate = async (clientId: string) => {
    if (confirm("Are you sure you want to reinstate this client?")) {
      await onReinstateClient(clientId);
    }
  };

  if (clients.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No clients found
        </h3>
        <p className="text-gray-500">
          Try adjusting your search or filter criteria.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/80 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Profile
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date of Registration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date Approved
              </th>
              
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clients.map((client) => (
              <>
                <tr
                key={client._id}
                  className={`
                    hover:bg-gray-50/50 transition-colors cursor-pointer
                    ${client.is_approved ? "bg-green-50/30" : "bg-red-50/30"}
                  `}
                  onClick={() => toggleRowExpansion(client._id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="relative w-14 h-14">
                      <Image
                        src={
                          client.avatar_url ||
                          "/assets/images/users/default-avatar.jpg"
                        }
                        alt={client.name}
                        fill
                        className="rounded-lg object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src =
                            "/assets/images/users/default-avatar.jpg";
                        }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {client.name}
                    </div>
                    <div className="flex items-center mt-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">
                        {client.client_average_rating?.toFixed(1) || "0.0"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{client.phone}</div>
                    <div className="text-xs text-gray-500 flex items-center mt-1">
                      <Phone className="w-3 h-3 mr-1" />
                      {client.isPhone_number_verified
                        ? "Verified"
                        : "Unverified"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(client.appliedAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getDateApproved(client)}
                    </div>
                  </td>
                 
                  
                </tr>

                {/* Expanded Details Row */}
                {expandedRow === client._id && (
                  <tr className="bg-gray-50/50">
                    <td colSpan={7} className="px-6 py-4">
                      <ClientDetails
                        client={client}
                        onSendMessage={onSendMessage}
                      />
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Suspend Modal */}
      <SuspendModal
        isOpen={showSuspendModal}
        onClose={() => {
          setShowSuspendModal(false);
          setSelectedClient(null);
        }}
        onConfirm={handleSuspendConfirm}
        clientName={selectedClient?.name || ""}
      />
    </>
  );
}
