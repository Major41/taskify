import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const { message, userType } = await request.json();
    const { db } = await connectToDatabase();

    // Build query based on user type
    let query = {};
    if (userType === "clients") {
      query = { isTasker: false };
    } else if (userType === "taskers") {
      query = { isTasker: true };
    }
    // If userType is 'all', query remains empty to get all users

    const users = await db
      .collection("users")
      .find(query, { projection: { _id: 1 } })
      .toArray();

    if (users.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No users found to send message to",
        },
        { status: 404 }
      );
    }

    // Create messages for all users
    const messages = users.map((user) => ({
      userId: user._id,
      message,
      direction: "admin_to_user",
      read: false,
      userType: user.isTasker ? "tasker" : "client",
      createdAt: new Date(),
    }));

    const result = await db.collection("adminmessages").insertMany(messages);

    return NextResponse.json({
      success: true,
      data: {
        sentCount: result.insertedCount,
        message,
        userType,
      },
      message: `Message sent to ${result.insertedCount} users successfully`,
    });
  } catch (error) {
    console.error("Broadcast message error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to send broadcast message",
      },
      { status: 500 }
    );
  }
}
