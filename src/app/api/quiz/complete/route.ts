import connectDB from "@/db/mongodb";
import { QuizResult, UserSession, Leaderboard } from "@/models";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, userName, answers } = body;

    if (!sessionId || !userName || !answers || !Array.isArray(answers)) {
      return Response.json({ error: "Données manquantes" }, { status: 400 });
    }

    await connectDB();

    const score = answers.filter((a: { isCorrect: boolean }) => a.isCorrect).length;

    const totalTime = answers.reduce(
      (acc: number, a: { timeSpent: number }) => acc + (a.timeSpent || 0),
      0
    );
    const avgTime = answers.length > 0 ? totalTime / answers.length : 0;

    // Sauvegarder le résultat du quiz
    await QuizResult.create({
      sessionId,
      userName: userName.trim(),
      answers,
      score,
      totalQuestions: answers.length,
    });

    // Mettre à jour la session
    await UserSession.findOneAndUpdate(
      { sessionId },
      { status: "completed", lastActivity: new Date() }
    );

    // Ajouter au leaderboard
    await Leaderboard.create({
      userName: userName.trim(),
      score,
      totalQuestions: answers.length,
      avgTimePerQuestion: avgTime,
    });

    return Response.json({ 
      score, 
      totalQuestions: answers.length, 
      message: "Quiz terminé" 
    });
  } catch (error) {
    console.error("Complete quiz error:", error);
    return Response.json({ error: "Failed to complete quiz" }, { status: 500 });
  }
}