import connectDB from "@/db/mongodb";
import { QuizResult } from "@/models/QuizResult";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, verifiedAnswers } = body;

    if (!sessionId || !verifiedAnswers || !Array.isArray(verifiedAnswers)) {
      return Response.json({ error: "Données manquantes" }, { status: 400 });
    }

    await connectDB();

    const score = verifiedAnswers.filter(
      (a: { isCorrect: boolean }) => a.isCorrect
    ).length;

    // Mettre à jour le résultat du quiz
    await QuizResult.findOneAndUpdate(
      { sessionId },
      { answers: verifiedAnswers, score }
    );

    return Response.json({ score, message: "Score vérifié" });
  } catch (error) {
    console.error("Verify error:", error);
    return Response.json({ error: "Failed to verify answers" }, { status: 500 });
  }
}