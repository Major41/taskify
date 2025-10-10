import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/lib/mongodb";


export async function GET() {
  try {
    // Get the session using next-auth
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
        },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();
    const userEmail = session.user.email;

    if (!userEmail) {
      return NextResponse.json(
        {
          success: false,
          message: "User email not found in session",
        },
        { status: 400 }
      );
    }

    // Fetch user from database including role
    const user = await db.collection("users").findOne(
      { email: userEmail },
      {
        projection: {
          _id: 1,
          first_name: 1,
          last_name: 1,
          email: 1,
          avatar_url: 1,
          phone_number: 1,
          isTasker: 1,
          role: { $ifNull: ["$role", "user"] }, // Default to 'user' if role doesn't exist
          isPhone_number_verified: 1,
          createdAt: 1,
        },
      }
    );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found in database",
        },
        { status: 404 }
      );
    }

    // Format the response
    const userData = {
      id: user._id,
      name: `${user.first_name} ${user.last_name}`,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      avatar: user.avatar_url,
      phone: user.phone_number,
      isTasker: user.isTasker,
      role: user.role || "user",
      isPhoneVerified: user.isPhone_number_verified || false,
      createdAt: user.createdAt,
    };

    return NextResponse.json({
      success: true,
      data: userData,
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch user data",
      },
      { status: 500 }
    );
  }
}
