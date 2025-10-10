// app/api/admin/taskers/send-message/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const { taskerId, message } = await request.json();

    if (!taskerId || !message) {
      return NextResponse.json(
        {
          success: false,
          message: "Tasker ID and message are required",
        },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Create a notification or message record
    const messageRecord = {
      tasker_id: taskerId,
      message: message,
      sent_by: "admin",
      sent_at: new Date(),
      is_read: false,
    };

    await db.collection("admin_messages").insertOne(messageRecord);

    return NextResponse.json({
      success: true,
      message: "Message sent to tasker successfully",
    });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to send message",
      },
      { status: 500 }
    );
  }
}
