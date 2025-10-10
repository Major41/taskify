import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    // Fetch all orders with populated client and tasker information
    const orders = await db
      .collection("requests")
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "clientInfo",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "tasker_id",
            foreignField: "_id",
            as: "taskerInfo",
          },
        },
        {
          $unwind: {
            path: "$clientInfo",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: "$taskerInfo",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            requestNumber: "$receipt_no",
            taskerName: { $ifNull: ["$taskerInfo.first_name", "N/A"] },
            taskerProfileImage: "$taskerInfo.profile_url",
            clientName: { $ifNull: ["$clientInfo.first_name", "N/A"] },
            clientPhone: { $ifNull: ["$clientInfo.phone_number", "N/A"] },
            status: "$notification_status",
            amount: { $ifNull: ["$budget", 0] },
            description: { $ifNull: ["$task_description", "No description"] },
            createdAt: { $ifNull: ["$createdAt", new Date()] },
            updatedAt: { $ifNull: ["$updatedAt", new Date()] },
            location: { $ifNull: ["$task_location", "N/A"] },
            category: { $ifNull: ["$category", "General"] },
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ])
      .toArray();

    return NextResponse.json({
      success: true,
      data: orders,
      message: "Orders fetched successfully",
    });
  } catch (error) {
    console.error("Orders fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch orders",
        data: [],
      },
      { status: 500 }
    );
  }
}
