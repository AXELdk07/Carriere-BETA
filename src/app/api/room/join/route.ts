import connectDB from "@/db/mongodb";
import { Room } from "@/models/Room";

export const dynamic = "force-dynamic";

// Interface pour les participants
interface Participant {
  name: string;
  score: number | null;
  totalQuestions: number | null;
  done: boolean;
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const { code, userName } = await request.json();

    // Validation des données
    if (!code || !userName || typeof userName !== "string" || userName.trim().length < 3) {
      return Response.json(
        { error: "Données invalides : code et nom (min. 3 caractères) requis" },
        { status: 400 }
      );
    }

    const trimmedName = userName.trim();
    const room = await Room.findOne({ code: code.toUpperCase() });

    if (!room) {
      return Response.json(
        { error: "Room introuvable. Vérifiez le code." },
        { status: 404 }
      );
    }

    // Vérifier si la partie est déjà en cours ou terminée
    if (room.status === "playing") {
      return Response.json(
        { error: "Cette partie est déjà en cours." },
        { status: 409 }
      );
    }

    if (room.status === "finished") {
      return Response.json(
        { error: "Cette partie est déjà terminée." },
        { status: 409 }
      );
    }

    // Vérifier si le nom est déjà pris
    const alreadyIn = room.participants.some((p: Participant) => p.name === trimmedName);
    if (alreadyIn) {
      return Response.json(
        { error: `Le nom "${trimmedName}" est déjà utilisé dans cette salle.` },
        { status: 409 }
      );
    }

    // Ajouter le participant
    room.participants.push({
      name: trimmedName,
      score: null,
      totalQuestions: null,
      done: false,
    });

    await room.save();

    // Retourner les données de la room
    return Response.json({
      code: room.code,
      quizPlayers: room.players,
      hostName: room.hostName,
      participants: room.participants.map((p: Participant) => p.name),
      message: `Bienvenue ${trimmedName} ! Vous avez rejoint la salle.`,
    });
  } catch (error) {
    console.error("❌ Join room error:", error);
    return Response.json(
      { error: "Impossible de rejoindre la room" },
      { status: 500 }
    );
  }
}