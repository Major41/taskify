// app/api/admin/verifications/stats/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    // Total verifications count
    const totalVerifications = await db
      .collection("acceptedRequests")
      .countDocuments();

    // Count by task status (which we use as verification status)
    const statusCounts = await db
      .collection("acceptedRequests")
      .aggregate([
        {
          $group: {
            _id: "$task_status",
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    // Convert to object for easier access
    const statusMap = statusCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const stats = {
      totalVerifications,
      pendingVerifications: statusMap["in_negotiation"] || 0,
      approvedVerifications: statusMap["Completed"] || 0,
      rejectedVerifications: statusMap["Canceled"] || 0,
      inNegotiation: statusMap["in_negotiation"] || 0,
      ongoing: statusMap["Ongoing"] || 0,
      completed: statusMap["Completed"] || 0,
      Canceled: statusMap["Canceled"] || 0,
    };

    return NextResponse.json({
      success: true,
      data: stats,
      message: "Verification stats fetched successfully",
    });
  } catch (error) {
    console.error("Verification stats error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch verification stats",
        data: null,
      },
      { status: 500 }
    );
  }
}
