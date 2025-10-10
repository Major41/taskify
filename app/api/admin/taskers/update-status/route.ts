// app/api/admin/taskers/update-status/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  try {
    const { taskerId, action, reason } = await request.json();
    console.log("Received taskerId:", taskerId, "Type:", typeof taskerId);

    if (!taskerId || !action) {
      return NextResponse.json(
        {
          success: false,
          message: "Tasker ID and action are required",
        },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // First, let's find the user with different ID formats
    console.log("Searching for user with ID:", taskerId);

    // Try as ObjectId
    let user = await db.collection("users").findOne({
      _id: new ObjectId(taskerId),
    });
    console.log("Found with ObjectId:", user ? "Yes" : "No");

    // If not found, try as string
    if (!user) {
      user = await db.collection("users").findOne({
        _id: taskerId,
      });
      console.log("Found with string ID:", user ? "Yes" : "No");
    }

    // If still not found, try with different field names
    if (!user) {
      user = await db.collection("users").findOne({
        id: taskerId,
      });
      console.log("Found with 'id' field:", user ? "Yes" : "No");
    }

    if (!user) {
      // Let's see what users exist to understand the ID format
      const sampleUsers = await db
        .collection("users")
        .find({})
        .limit(3)
        .toArray();
      console.log(
        "Sample users from database:",
        sampleUsers.map((u) => ({
          id: u._id,
          idType: typeof u._id,
          hasTaskerField: u.isTasker !== undefined,
        }))
      );

      return NextResponse.json(
        {
          success: false,
          message: `Tasker not found with ID: ${taskerId}`,
          debug: {
            receivedId: taskerId,
            sampleUsers: sampleUsers.map((u) => u._id),
          },
        },
        { status: 404 }
      );
    }

    console.log("Found user:", {
      id: user._id,
      idType: typeof user._id,
      name: user.first_name + " " + user.last_name,
      isTasker: user.isTasker,
      status: user.tasker_application_status,
    });

    let updateData: any = {};

    if (action === "suspend") {
      updateData = {
        tasker_application_status: "Suspended",
        
      };
    } else if (action === "reinstate") {
      updateData = {
        tasker_application_status: "Approved",
        
      };
    }

    // Use the same ID format that worked for finding the user
    const query =
      user._id instanceof ObjectId
        ? { _id: new ObjectId(taskerId) }
        : { _id: taskerId };

    const result = await db
      .collection("users")
      .updateOne(query, { $set: updateData });

    console.log("Update result:", result);

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No changes made - user may already have this status",
          currentStatus: user.tasker_application_status,
          currentIsTasker: user.isTasker,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Tasker ${
        action === "suspend" ? "suspended" : "reinstated"
      } successfully`,
    });
  } catch (error) {
    console.error("Update tasker status error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update tasker status",
      },
      { status: 500 }
    );
  }
}
