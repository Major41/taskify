import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    // Count applications by status
    const totalApplications = await db
      .collection("taskerapplications")
      .countDocuments();
    const pendingApplications = await db
      .collection("taskerapplications")
      .countDocuments({ status: "pending" });
    const approvedApplications = await db
      .collection("taskerapplications")
      .countDocuments({ status: "approved" });
    const rejectedApplications = await db
      .collection("taskerapplications")
      .countDocuments({ status: "rejected" });

    const approvalRate =
      totalApplications > 0
        ? Math.round((approvedApplications / totalApplications) * 100)
        : 0;

    const stats = {
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      approvalRate,
    };

    return NextResponse.json({
      success: true,
      data: stats,
      message: "Application stats fetched successfully",
    });
  } catch (error) {
    console.error("Application stats error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch application stats",
        data: null,
      },
      { status: 500 }
    );
  }
}
