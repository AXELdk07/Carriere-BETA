import connectDB from "@/db/mongodb";
import { Room } from "@/models/Room";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await connectDB();

    const { code, hostName, corrections } = await request.json();

    if (!code || !hostName || !corrections || !Array.isArray(corrections)) {
      return Response.json(
        { error: "Données invalides" },
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

    // Vérifier que c'est bien l'hôte
    if (room.hostName !== hostName.trim()) {
      return Response.json(
        { error: "Seul l'hôte peut corriger les réponses" },
        { status: 403 }
      );
    }

    // Vérifier que la room est en mode "reviewing"
    if (room.status !== "reviewing") {
      return Response.json(
        { error: "La room n'est pas en mode correction" },
        { status: 409 }
      );
    }

    // Sauvegarder les corrections
    room.corrections = corrections;

    // Vérifier si toutes les questions sont vérifiées
    const totalCells = room.participants.length * room.players.length;
    const verifiedCells = corrections.length;
    room.allVerified = verifiedCells === totalCells;

    await room.save();

    return Response.json({
      message: "Corrections sauvegardées",
      corrections: room.corrections,
      allVerified: room.allVerified,
    });
  } catch (error) {
    console.error("❌ Correction error:", error);
    return Response.json(
      { error: "Impossible de sauvegarder les corrections" },
      { status: 500 }
    );
  }
}