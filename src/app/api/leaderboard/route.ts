import connectDB from "@/db/mongodb";
import { Leaderboard } from "@/models";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();

    const top10 = await Leaderboard.find()
      .sort({ score: -1, avgTimePerQuestion: 1 })
      .limit(10)
      .select("userName score totalQuestions avgTimePerQuestion completedAt");

    return Response.json({ leaderboard: top10 });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return Response.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}