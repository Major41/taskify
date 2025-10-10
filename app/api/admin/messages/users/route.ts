import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    const users = await db
      .collection("users")
      .aggregate([
        {
          $project: {
            _id: 1,
            name: {
              $concat: ["$first_name", " ", "$last_name"],
            },
            first_name: 1,
            last_name: 1,
            email: 1,
            avatar_url: 1,
            isTasker: 1,
            phone_number: 1,
            userType: {
              $cond: {
                if: { $eq: ["$isTasker", true] },
                then: "tasker",
                else: "client",
              },
            },
            lastActive: 1,
          },
        },
        {
          $sort: { name: 1 },
        },
      ])
      .toArray();

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Users fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch users",
      },
      { status: 500 }
    );
  }
}
