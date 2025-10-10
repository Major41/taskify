// app/api/admin/taskers/stats/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));

    // Total taskers count
    const totalTaskers = await db.collection("users").countDocuments({
      isTasker: true,
    });

    // Active taskers (approved and accepting requests)
    const activeTaskers = await db.collection("users").countDocuments({
      isTasker: true,
      tasker_application_status: "Approved",
      verification_level1_status: "Verified",
      verification_level2_status: "Verified",
    });

    // Suspended taskers
    const suspendedTaskers = await db.collection("users").countDocuments({
      isTasker: true,
      $or: [
        { tasker_application_status: { $ne: "Approved" } },
        { verification_level1_status: { $ne: "Verified" } },
        { verification_level2_status: { $ne: "Verified" } },
      ],
    });

    // New taskers today
    const newTaskersToday = await db.collection("users").countDocuments({
      isTasker: true,
      dateOfVerificationApplicationRequest: {
        $gte: startOfToday.getTime(),
      },
    });

    // Verified taskers (all levels verified)
    const verifiedTaskers = await db.collection("users").countDocuments({
      isTasker: true,
      verification_level1_status: "Verified",
      verification_level2_status: "Verified",
      verification_level3_status: "Verified",
      verification_level4_status: "Verified",
      verification_level5_status: "Verified",
    });

    // Pending verification
    const pendingVerification = await db.collection("users").countDocuments({
      isTasker: true,
      $or: [
        { verification_level1_status: "Pending" },
        { verification_level2_status: "Pending" },
        { verification_level3_status: "Pending" },
        { verification_level4_status: "Pending" },
        { verification_level5_status: "Pending" },
      ],
    });

    // Average rating
    const averageRating = await db
      .collection("users")
      .aggregate([
        {
          $match: { isTasker: true },
        },
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$client_average_rating" },
          },
        },
      ])
      .toArray();

    const stats = {
      totalTaskers,
      activeTaskers,
      suspendedTaskers,
      newTaskersToday,
      verifiedTaskers,
      pendingVerification,
      averageRating: averageRating[0]?.averageRating || 0,
    };

    return NextResponse.json({
      success: true,
      data: stats,
      message: "Tasker stats fetched successfully",
    });
  } catch (error) {
    console.error("Tasker stats error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch tasker stats",
        data: null,
      },
      { status: 500 }
    );
  }
}
