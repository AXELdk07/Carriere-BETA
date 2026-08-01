import connectDB from "@/db/mongodb";
import { UserSession } from "@/models/UserSession";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userName } = body;

    if (!userName || typeof userName !== "string" || userName.trim().length < 3) {
      return Response.json(
        { error: "Le nom doit contenir au moins 3 caractères" },
        { status: 400 }
      );
    }

    await connectDB();

    const sessionId = crypto.randomBytes(16).toString("hex");

    await UserSession.create({
      sessionId,
      userName: userName.trim(),
      currentQuestion: 0,
      status: "active",
    });

    return Response.json({ sessionId, message: "Quiz démarré" });
  } catch (error) {
    console.error("Start quiz error:", error);
    return Response.json({ error: "Failed to start quiz" }, { status: 500 });
  }
}