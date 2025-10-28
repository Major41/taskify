// "use client";

// import { useEffect, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import Image from "next/image";
// import Link from "next/link";
// import {
//   ArrowLeft,
//   CheckCircle,
//   XCircle,
//   MessageCircle,
//   Download,
// } from "lucide-react";
// import { TaskerApplication } from "@/types/application";

// export default function ApplicationDetailPage() {
//   const params = useParams();
//   const router = useRouter();
//   const [application, setApplication] = useState<TaskerApplication | null>(
//     null
//   );
//   const [loading, setLoading] = useState(true);

//   // useEffect(() => {
//   //   if (params.id) {
//   //     loadApplication(params.id as string);
//   //   }
//   // }, [params.id]);

//   // const loadApplication = async (applicationId: string) => {
//   //   try {
//   //     const response = await fetch(`/api/admin/applications/${applicationId}`);

//   //     if (!response.ok) {
//   //       throw new Error("Failed to fetch application details");
//   //     }

//   //     const data = await response.json();

//   //     if (data.success) {
//   //       setApplication(data.data);
//   //     } else {
//   //       throw new Error(data.message || "Failed to load application details");
//   //     }
//   //   } catch (error) {
//   //     console.error("Failed to load application:", error);
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   const handleApprove = async () => {
//     if (!application) return;
//     setLoading(true);

//     try {
//       const response = await fetch("/api/admin/applications/approve", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           applicationId: application._id,
//         }),
//       });

//       if (response.ok) {
//         router.push("/applications");
//       }
//     } catch (error) {
//       console.error("Failed to approve application:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleReject = async () => {
//     if (!application) return;

//     const reason = prompt("Please provide a reason for rejection:");
//     if (reason === null) return;

//     try {
//       const response = await fetch("/api/admin/applications/reject", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           applicationId: application._id,
//           reason,
//         }),
//       });

//       if (response.ok) {
//         router.push("/applications");
//       }
//     } catch (error) {
//       console.error("Failed to reject application:", error);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="p-6">
//         <div className="flex items-center justify-center h-64">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
//             <p className="mt-2 text-gray-600">Loading application details...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!application) {
//     return (
//       <div className="p-6">
//         <div className="text-center py-12">
//           <h3 className="text-lg font-medium text-gray-900 mb-2">
//             Application not found
//           </h3>
//           <Link
//             href="/applications"
//             className="text-green-600 hover:text-green-700"
//           >
//             Back to Applications
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         <div className="flex items-center space-x-4">
//           <Link
//             href="/applications"
//             className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//           >
//             <ArrowLeft className="w-5 h-5 text-gray-600" />
//           </Link>
//           <div>
//             <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
//               Application Details
//             </h1>
//             <p className="text-gray-600 mt-1">Review tasker application</p>
//           </div>
//         </div>

//         {application.status === "pending" && (
//           <div className="flex items-center space-x-3">
//             <button
//               onClick={handleApprove}
//               className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
//             >
//               <CheckCircle className="w-4 h-4" />
//               <span>Approve</span>
//             </button>
//             <button
//               onClick={handleReject}
//               className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
//             >
//               <XCircle className="w-4 h-4" />
//               <span>Reject</span>
//             </button>
//           </div>
//         )}
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Main Content */}
//         <div className="lg:col-span-2 space-y-6">
//           {/* Applicant Info */}
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-6">
//             <div className="flex items-center space-x-4">
//               <Image
//                 src={
//                   application.user.avatar_url ||
//                   "/assets/images/users/default-avatar.jpg"
//                 }
//                 alt={application.user.name}
//                 width={80}
//                 height={80}
//                 className="rounded-xl"
//               />
//               <div>
//                 <h2 className="text-xl font-bold text-gray-900">
//                   {application.user.name}
//                 </h2>
//                 <p className="text-gray-600">{application.user.phone}</p>
//                 <p className="text-gray-600">{application.user.email}</p>
//                 <div className="flex items-center space-x-2 mt-2">
//                   <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
//                     {application.category}
//                   </span>
//                   <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
//                     {application.experience}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* About Section */}
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
//             <p className="text-gray-700 leading-relaxed">{application.about}</p>
//           </div>

//           {/* Skills Section */}
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
//             <div className="flex flex-wrap gap-2">
//               {application.skills.map((skill, index) => (
//                 <span
//                   key={index}
//                   className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full"
//                 >
//                   {skill}
//                 </span>
//               ))}
//             </div>
//           </div>

//           {/* Work Images */}
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">
//               Previous Work Images
//             </h3>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               {application.workImages.map((image, index) => (
//                 <div key={index} className="relative group">
//                   <Image
//                     src={image}
//                     alt={`Work sample ${index + 1}`}
//                     width={200}
//                     height={150}
//                     className="rounded-lg object-cover w-full h-32"
//                   />
//                   <button className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">
//                     <Download className="w-4 h-4" />
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Sidebar */}
//         <div className="space-y-6">
//           {/* ID Images */}
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">
//               Identification Documents
//             </h3>
//             <div className="space-y-4">
//               {application.idImages.passport && (
//                 <div>
//                   <h4 className="text-sm font-medium text-gray-700 mb-2">
//                     Passport
//                   </h4>
//                   <Image
//                     src={application.idImages.passport}
//                     alt="Passport"
//                     width={300}
//                     height={200}
//                     className="rounded-lg border border-gray-200"
//                   />
//                 </div>
//               )}
//               <div>
//                 <h4 className="text-sm font-medium text-gray-700 mb-2">
//                   ID Front
//                 </h4>
//                 <Image
//                   src={application.idImages.idFront}
//                   alt="ID Front"
//                   width={300}
//                   height={200}
//                   className="rounded-lg border border-gray-200"
//                 />
//               </div>
//               <div>
//                 <h4 className="text-sm font-medium text-gray-700 mb-2">
//                   ID Back
//                 </h4>
//                 <Image
//                   src={application.idImages.idBack}
//                   alt="ID Back"
//                   width={300}
//                   height={200}
//                   className="rounded-lg border border-gray-200"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Application Status */}
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">
//               Application Status
//             </h3>
//             <div className="space-y-3">
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Status:</span>
//                 <span
//                   className={`px-2 py-1 rounded-full text-xs font-medium ${
//                     application.status === "pending"
//                       ? "bg-yellow-100 text-yellow-800"
//                       : application.status === "approved"
//                       ? "bg-green-100 text-green-800"
//                       : "bg-red-100 text-red-800"
//                   }`}
//                 >
//                   {application.status.charAt(0).toUpperCase() +
//                     application.status.slice(1)}
//                 </span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Applied:</span>
//                 <span className="text-gray-900">
//                   {new Date(application.appliedAt).toLocaleDateString()}
//                 </span>
//               </div>
//               {application.reviewedAt && (
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Reviewed:</span>
//                   <span className="text-gray-900">
//                     {new Date(application.reviewedAt).toLocaleDateString()}
//                   </span>
//                 </div>
//               )}
//               {application.rejectionReason && (
//                 <div>
//                   <span className="text-gray-600">Rejection Reason:</span>
//                   <p className="text-gray-900 mt-1 text-sm">
//                     {application.rejectionReason}
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Quick Actions */}
//           {application.status === "pending" && (
//             <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-6">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                 Quick Actions
//               </h3>
//               <div className="space-y-3">
//                 <button
//                   onClick={handleApprove}
//                   className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
//                 >
//                   <CheckCircle className="w-4 h-4" />
//                   <span>Approve Application</span>
//                 </button>
//                 <button
//                   onClick={handleReject}
//                   className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
//                 >
//                   <XCircle className="w-4 h-4" />
//                   <span>Reject Application</span>
//                 </button>
//                 <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
//                   <MessageCircle className="w-4 h-4" />
//                   <span>Message Applicant</span>
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
