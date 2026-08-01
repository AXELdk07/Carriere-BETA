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
        { error: "Room introuvable. Vérifiez le code." },
        { status: 404 }
      );
    }

    // Vérifier que c'est bien l'hôte qui démarre
    if (room.hostName !== hostName.trim()) {
      return Response.json(
        { error: "Seul l'hôte peut démarrer la partie" },
        { status: 403 }
      );
    }

    // Vérifier que la room est en attente
    if (room.status !== "waiting") {
      return Response.json(
        { error: "La partie a déjà démarré ou est terminée" },
        { status: 409 }
      );
    }

    // Vérifier qu'il y a au moins un participant (l'hôte)
    if (room.participants.length === 0) {
      return Response.json(
        { error: "Aucun participant dans la salle" },
        { status: 400 }
      );
    }

    // Démarrer la partie
    room.status = "playing";
    await room.save();

    return Response.json({
      message: "Partie démarrée !",
      code: room.code,
      status: room.status,
      participants: room.participants.map((p: Participant) => p.name),
      totalPlayers: room.participants.length,
    });
  } catch (error) {
    console.error("❌ Start room error:", error);
    return Response.json(
      { error: "Impossible de démarrer la partie" },
      { status: 500 }
    );
  }
}