import connectDB from "@/db/mongodb";
import { Player } from "@/models/Player";
import { Room } from "@/models/Room";

export const dynamic = "force-dynamic";

// Interface pour les participants
interface Participant {
  name: string;
  score: number | null;
  totalQuestions: number | null;
  done: boolean;
}

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const { userName } = await request.json();

    if (!userName || typeof userName !== "string" || userName.trim().length < 3) {
      return Response.json(
        { error: "Le nom doit contenir au moins 3 caractères" },
        { status: 400 }
      );
    }

    // Dédupliquer d'abord par playerId. Cela protège aussi les parties créées
    // avec une collection MongoDB qui contiendrait accidentellement des doublons.
    const allPlayers = await Player.aggregate([
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

    if (allPlayers.length < 10) {
      return Response.json(
        { error: "Au moins 10 joueurs uniques sont nécessaires pour créer une partie." },
        { status: 500 }
      );
    }

    // Générer un code unique
    let code = "";
    let attempts = 0;
    do {
      code = generateRoomCode();
      const existing = await Room.findOne({ code });
      if (!existing) break;
      attempts++;
    } while (attempts < 10);

    if (attempts >= 10) {
      return Response.json(
        { error: "Impossible de générer un code unique. Réessayez." },
        { status: 500 }
      );
    }

    const trimmedName = userName.trim();
    const room = await Room.create({
      code,
      players: allPlayers,
      hostName: trimmedName,
      participants: [{ name: trimmedName, score: null, totalQuestions: null, done: false }],
      status: "waiting",
    });

    return Response.json({
      code: room.code,
      quizPlayers: room.players,
      hostName: room.hostName,
      participants: room.participants.map((p: Participant) => p.name),
      message: "Room créée avec succès !",
    });
  } catch (error) {
    console.error("❌ Create room error:", error);
    return Response.json(
      { error: "Impossible de créer la room" },
      { status: 500 }
    );
  }
}
