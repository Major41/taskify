import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    const messages = await db
      .collection("adminmessages")
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            userId: 1,
            userName: {
              $concat: ["$user.first_name", " ", "$user.last_name"],
            },
            userType: {
              $cond: {
                if: { $eq: ["$user.isTasker", true] },
                then: "tasker",
                else: "client",
              },
            },
            userAvatar: "$user.profile_url",
            message: 1,
            direction: 1, // 'admin_to_user' or 'user_to_admin'
            read: 1,
            createdAt: 1,
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ])
      .toArray();

    return NextResponse.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Messages fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch messages",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId, message, userType } = await request.json();
    const { db } = await connectToDatabase();

    const newMessage = {
      userId,
      message,
      direction: "admin_to_user",
      read: false,
      userType,
      createdAt: new Date(),
    };

    const result = await db.collection("adminmessages").insertOne(newMessage);

    return NextResponse.json({
      success: true,
      data: { ...newMessage, _id: result.insertedId },
      message: "Message sent successfully",
    });
  } catch (error) {
    console.error("Message send error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to send message",
      },
      { status: 500 }
    );
  }
}
