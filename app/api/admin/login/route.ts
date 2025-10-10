import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { phone_number, password } = await request.json();
    // console.log("Login attempt for phone:", phone_number);

    // Validate required fields
    if (!phone_number || !password) {
      return NextResponse.json(
        { success: false, message: "Phone number and password are required" },
        { status: 400 }
      );
    }

    // Connect to database
    const { db } = await connectToDatabase();

    // Check if users collection exists
    const usersCollection = db.collection("users");


    // Find user by phone number and role
    const user = await usersCollection.findOne({
      phone_number: phone_number,
      role: { $in: ["ADMIN", "SUPER_ADMIN"] },
    });

    // console.log("Found user:", user);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid phone number or admin access denied",
        },
        { status: 401 }
      );
    }

    // // Verify password
    // const isPasswordValid = await bcrypt.compare(password, user.salt);
    // console.log("Password valid:", isPasswordValid);

    // if (!isPasswordValid) {
    //   return NextResponse.json(
    //     { success: false, message: "Invalid password" },
    //     { status: 401 }
    //   );
    // }

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}