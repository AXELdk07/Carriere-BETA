import connectDB from "@/db/mongodb";
import { Room } from "@/models/Room";
import { Leaderboard } from "@/models/Leaderboard";

export const dynamic = "force-dynamic";

interface Participant {
  name: string;
  score: number | null;
  totalQuestions: number | null;
  avgTimePerQuestion: number | null;
  done: boolean;
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const { code, playerName, score, totalQuestions, avgTimePerQuestion } = await request.json();

    // Validation des données
    if (!code || !playerName || score === undefined || score === null || !totalQuestions) {
      return Response.json(
        { error: "Données manquantes : code, playerName, score et totalQuestions sont requis" },
        { status: 400 }
      );
    }

    if (typeof playerName !== "string" || playerName.trim().length < 3) {
      return Response.json(
        { error: "Le nom doit contenir au moins 3 caractères" },
        { status: 400 }
      );
    }

    if (typeof score !== "number" || score < 0 || score > totalQuestions) {
      return Response.json(
        { error: `Score invalide (doit être entre 0 et ${totalQuestions})` },
        { status: 400 }
      );
    }

    if (
      avgTimePerQuestion !== null &&
      (typeof avgTimePerQuestion !== "number" ||
        !Number.isFinite(avgTimePerQuestion) ||
        avgTimePerQuestion < 0)
    ) {
      return Response.json(
        { error: "Temps moyen invalide" },
        { status: 400 }
      );
    }

    const room = await Room.findOne({ code: code.toUpperCase() });

    if (!room) {
      return Response.json(
        { error: "Room introuvable. Vérifiez le code." },
        { status: 404 }
      );
    }

    if (room.status !== "playing") {
      return Response.json(
        { error: "La partie n'est pas en cours" },
        { status: 409 }
      );
    }

    const participant = room.participants.find((p: Participant) => p.name === playerName.trim());

    if (!participant) {
      return Response.json(
        { error: "Participant introuvable dans cette room" },
        { status: 404 }
      );
    }

    if (participant.done) {
      return Response.json(
        { error: "Vous avez déjà soumis votre score" },
        { status: 409 }
      );
    }

    // ✅ Mise à jour avec avgTimePerQuestion
    participant.score = score;
    participant.totalQuestions = totalQuestions;
    participant.avgTimePerQuestion = avgTimePerQuestion;
    participant.done = true;

    const allDone = room.participants.every((p: Participant) => p.done);

    if (allDone) {
      room.status = "finished";
      
      // Enregistrer dans le leaderboard global
      for (const p of room.participants) {
        if (p.score !== null && p.totalQuestions !== null) {
          await Leaderboard.create({
            userName: p.name,
            score: p.score,
            totalQuestions: p.totalQuestions,
            avgTimePerQuestion: p.avgTimePerQuestion,
            completedAt: new Date(),
          });
        }
      }
    }

    await room.save();

    return Response.json({
      message: "Score soumis avec succès",
      participant: {
        name: participant.name,
        score: participant.score,
        totalQuestions: participant.totalQuestions,
        avgTimePerQuestion: participant.avgTimePerQuestion,
        done: participant.done,
      },
      allDone,
      status: room.status,
    });
  } catch (error) {
    console.error("❌ Submit score error:", error);
    return Response.json(
      { error: "Impossible de soumettre le score" },
      { status: 500 }
    );
  }
}
