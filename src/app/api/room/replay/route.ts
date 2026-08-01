import connectDB from "@/db/mongodb";
import { Player } from "@/models/Player";
import { Room } from "@/models/Room";

export const dynamic = "force-dynamic";

// Interfaces pour le typage
interface QuizPlayer {
  playerId: number;
  name: string;
  career: string[];
}

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

    const { code, hostName } = await request.json();

    if (!code || !hostName) {
      return Response.json(
        { error: "Code et nom d'hôte requis" },
        { status: 400 }
      );
    }

    if (typeof hostName !== "string" || hostName.trim().length < 3) {
      return Response.json(
        { error: "Le nom doit contenir au moins 3 caractères" },
        { status: 400 }
      );
    }

    const room = await Room.findOne({ code: code.toUpperCase() });

    if (!room) {
      return Response.json(
        { error: "Room introuvable" },
        { status: 404 }
      );
    }

    // Vérifier que c'est bien l'hôte qui demande le replay
    if (room.hostName !== hostName.trim()) {
      return Response.json(
        { error: "Seul l'hôte peut relancer une partie" },
        { status: 403 }
      );
    }

    // Vérifier que la partie est terminée
    if (room.status !== "finished") {
      return Response.json(
        { error: "La partie doit être terminée pour rejouer" },
        { status: 409 }
      );
    }

    // Récupérer les IDs des joueurs déjà utilisés dans cette salle
    const usedPlayerIds: number[] = room.players.map((p: QuizPlayer) => p.playerId);

    // Sélectionner 10 nouveaux joueurs aléatoires (excluant les utilisés)
    let newPlayers = await Player.aggregate([
      { $match: { playerId: { $nin: usedPlayerIds } } },
      {
        $group: {
          _id: "$playerId",
          player: { $first: { playerId: "$playerId", name: "$name", career: "$career" } },
        },
      },
      { $replaceRoot: { newRoot: "$player" } },
      { $set: { normalizedName: { $toLower: { $trim: { input: "$name" } } } } },
      {
        $group: {
          _id: "$normalizedName",
          player: { $first: { playerId: "$playerId", name: "$name", career: "$career" } },
        },
      },
      { $replaceRoot: { newRoot: "$player" } },
      { $sample: { size: 10 } },
      { $project: { _id: 0, playerId: 1, name: 1, career: 1 } },
    ]);

    // Si pas assez de nouveaux joueurs, prendre des joueurs aléatoires (peut inclure des doublons)
    if (!newPlayers || newPlayers.length < 10) {
      const fallbackPlayers = await Player.aggregate([
        {
          $group: {
            _id: "$playerId",
            player: { $first: { playerId: "$playerId", name: "$name", career: "$career" } },
          },
        },
        { $replaceRoot: { newRoot: "$player" } },
        { $set: { normalizedName: { $toLower: { $trim: { input: "$name" } } } } },
        {
          $group: {
            _id: "$normalizedName",
            player: { $first: { playerId: "$playerId", name: "$name", career: "$career" } },
          },
        },
        { $replaceRoot: { newRoot: "$player" } },
        { $sample: { size: 10 } },
        { $project: { _id: 0, playerId: 1, name: 1, career: 1 } },
      ]);
      
      if (fallbackPlayers && fallbackPlayers.length >= 10) {
        newPlayers = fallbackPlayers;
      } else {
        return Response.json(
          { error: "Au moins 10 joueurs uniques sont nécessaires pour relancer une partie." },
          { status: 500 }
        );
      }
    }

    // Remplacer les joueurs par les nouveaux
    room.players = newPlayers;

    // Réinitialiser les participants (garder les noms, réinitialiser les scores)
    room.participants = room.participants.map((p: Participant) => ({
      name: p.name,
      score: null,
      totalQuestions: null,
      avgTimePerQuestion: null,
      done: false,
    }));

    // Remettre le statut en "waiting"
    room.status = "waiting";

    await room.save();

    return Response.json({
      message: "Nouvelle partie prête !",
      code: room.code,
      quizPlayers: room.players,
      hostName: room.hostName,
      participants: room.participants.map((p: Participant) => p.name),
      status: room.status,
    });
  } catch (error) {
    console.error("❌ Replay room error:", error);
    return Response.json(
      { error: "Impossible de relancer la partie" },
      { status: 500 }
    );
  }
}
