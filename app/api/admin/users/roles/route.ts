import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET(request: Request) {
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
            phone_number: 1,
            isTasker: 1,
            role: { $ifNull: ["$role", "user"] },
            createdAt: 1,
            isPhone_number_verified: 1,
            client_average_rating: 1,
            client_complete_tasks: 1,
          },
        },
        {
          $sort: { createdAt: -1 },
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

export async function PUT(request: Request) {
  try {
    const { userId, role, currentUserRole } = await request.json();

    // Check if current user is SUPER ADMIN
    if (currentUserRole !== "SUPER ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Only SUPER ADMIN can modify user roles",
        },
        { status: 403 }
      );
    }

    // Validate role
    const validRoles = ["USER", "ADMIN", "SUPER ADMIN"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid role specified",
        },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Update user role
    const result = await db.collection("users").updateOne(
      { _id: userId },
      {
        $set: {
          role: role,
          roleUpdatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `User role updated to ${role} successfully`,
    });
  } catch (error) {
    console.error("Role update error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update user role",
      },
      { status: 500 }
    );
  }
}
