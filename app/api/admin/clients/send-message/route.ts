// app/api/admin/clients/send-message/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const { clientId, message } = await request.json();

    if (!clientId || !message) {
      return NextResponse.json(
        {
          success: false,
          message: "Client ID and message are required",
        },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Create a notification or message record
    const messageRecord = {
      client_id: clientId,
      message: message,
      sent_by: "admin",
      sent_at: new Date(),
      is_read: false,
    };

    await db.collection("admin_messages").insertOne(messageRecord);

    return NextResponse.json({
      success: true,
      message: "Message sent to client successfully",
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
