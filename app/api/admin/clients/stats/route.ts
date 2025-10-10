// app/api/admin/clients/stats/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));

    // Total clients count
    const totalClients = await db.collection("users").countDocuments({
      isTasker: false,
    });

    // Active clients (phone verified)
    const activeClients = await db.collection("users").countDocuments({
      isTasker: false,
      isPhone_number_verified: true,
    });

    // Suspended clients (phone not verified)
    const suspendedClients = await db.collection("users").countDocuments({
      isTasker: false,
      isPhone_number_verified: false,
    });

    // New clients today
    const newClientsToday = await db.collection("users").countDocuments({
      isTasker: false,
      dateOfVerificationApplicationRequest: {
        $gte: startOfToday.getTime(),
      },
    });

    // Average rating
    const averageRating = await db
      .collection("users")
      .aggregate([
        {
          $match: { isTasker: false },
        },
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$client_average_rating" },
          },
        },
      ])
      .toArray();

    // Clients with completed tasks
    const clientsWithCompletedTasks = await db
      .collection("users")
      .countDocuments({
        isTasker: false,
        client_complete_tasks: { $gt: 0 },
      });

    const stats = {
      totalClients,
      activeClients,
      suspendedClients,
      newClientsToday,
      clientsWithCompletedTasks,
      averageRating: averageRating[0]?.averageRating || 0,
    };

    return NextResponse.json({
      success: true,
      data: stats,
      message: "Client stats fetched successfully",
    });
  } catch (error) {
    console.error("Client stats error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch client stats",
        data: null,
      },
      { status: 500 }
    );
  }
}
