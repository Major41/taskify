import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    // Connect to database
    const { db } = await connectToDatabase();

    // Count requests by notification_status
    const pendingTasks = await db.collection("requests").countDocuments({
      notification_status: "Pending",
    });

    const inNegotiation = await db.collection("acceptedRequests").countDocuments({
      notification_status: "in_negotiation",
    });

    const canceledTasks = await db.collection("requests").countDocuments({
      notification_status: "Canceled",
    });

    const expiredTasks = await db.collection("requests").countDocuments({
      notification_status: "Expired",
    });

    // Count accepted requests by task_status
    const ongoingTasks = await db
      .collection("acceptedRequests")
      .countDocuments({
        task_status: "Ongoing",
      });

    const completedTasks = await db.collection("acceptedRequests").countDocuments({
      task_status: "Completed",
    });

    // Count total taskers and clients
    const taskers = await db.collection("taskers").countDocuments();

    const clients = await db.collection("users").countDocuments({
      role: "USER", // Adjust this based on your role system
    });

    const dashboardData = {
      pendingTasks,
      inNegotiation,
      canceledTasks,
      expiredTasks,
      ongoingTasks,
      completedTasks,
      taskers,
      clients,
    };


    return NextResponse.json({
      success: true,
      data: dashboardData,
      message: "Dashboard stats fetched successfully",
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch dashboard statistics",
        data: null,
      },
      { status: 500 }
    );
  }
}
