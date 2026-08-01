import connectDB from "@/db/mongodb";
import { Room } from "@/models/Room";

export const dynamic = "force-dynamic";

// Interface pour les participants
interface Participant {
  name: string;
  score: number | null;
  totalQuestions: number | null;
  avgTimePerQuestion: number | null;
  done: boolean;
}

// Interface pour les joueurs du quiz
interface QuizPlayer {
  playerId: number;
  name: string;
  career: string[];
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> } // ← Correction ici : Promise
) {
  try {
    await connectDB();

    const { code } = await params; // ← Attendre la résolution de la promesse

    if (!code || code.length !== 6) {
      return Response.json(
        { error: "Code invalide (6 caractères requis)" },
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

    // Vérifier si tous les participants ont fini
    const allDone = room.participants.every((p: Participant) => p.done);

    // Si tous ont fini et que le statut n'est pas encore "finished", le mettre à jour
    if (allDone && room.status === "playing") {
      room.status = "finished";
      await room.save();
    }

    // Construire la réponse avec les données de la room
    return Response.json({
      code: room.code,
      status: room.status,
      hostName: room.hostName,
      participants: room.participants.map((p: Participant) => ({
        name: p.name,
        score: p.score,
        totalQuestions: p.totalQuestions,
        avgTimePerQuestion: p.avgTimePerQuestion,
        done: p.done,
      })),
      allDone,
      // Optionnel : les joueurs football du quiz
      quizPlayers: room.players.map((p: QuizPlayer) => ({
        playerId: p.playerId,
        name: p.name,
        career: p.career,
      })),
      totalParticipants: room.participants.length,
      createdAt: room.createdAt,
    });
  } catch (error) {
    console.error("❌ Get room error:", error);
    return Response.json(
      { error: "Impossible de récupérer les informations de la room" },
      { status: 500 }
    );
  }
}
