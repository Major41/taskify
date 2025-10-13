// app/api/admin/clients/update-status/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  try {
    const { clientId, action, reason } = await request.json();

    if (!clientId || !action) {
      return NextResponse.json(
        {
          success: false,
          message: "Client ID and action are required",
        },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    let updateData: any = {};

    if (action === "suspend") {
      updateData = {
        role:""
      };
    } else if (action === "reinstate") {
      updateData = {
       role:"USER"
      };
    }

    const result = await db
      .collection("users")
      .updateOne({ _id: new ObjectId(clientId) }, { $set: updateData });

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Client not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Client ${
        action === "suspend" ? "suspended" : "reinstated"
      } successfully`,
    });
  } catch (error) {
    console.error("Update client status error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update client status",
      },
      { status: 500 }
    );
  }
}
