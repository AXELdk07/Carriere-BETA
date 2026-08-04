import connectDB from "@/db/mongodb";
import { Room } from "@/models/Room";

export const dynamic = "force-dynamic";

// Interface pour un participant
interface Participant {
  name: string;
  score: number | null;
  totalQuestions: number | null;
  avgTimePerQuestion: number | null;
  done: boolean;
}

// ✅ GET - Récupérer le statut de la room
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
      return Response.json(
        { error: "Code requis" },
        { status: 400 }
      );
    }

    await connectDB();

    const room = await Room.findOne({ code: code.toUpperCase() });

    if (!room) {
      return Response.json(
        { error: "Room introuvable" },
        { status: 404 }
      );
    }

    // ✅ Vérifier si tous les participants ont fini (avec typage explicite)
    const allDone = room.participants.length > 0 && room.participants.every((p: Participant) => p.done === true);

    // ✅ Si tous ont fini et que la room est en "playing", passer en "reviewing"
    if (allDone && room.status === "playing") {
      room.status = "reviewing";
      await room.save();
    }

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
      corrections: room.corrections || [],
      allVerified: room.allVerified || false,
      totalQuestions: room.players.length,
      allDone,
      quizPlayers: room.players,
    });
  } catch (error) {
    console.error("❌ Status error:", error);
    return Response.json(
      { error: "Impossible de récupérer le statut" },
      { status: 500 }
    );
  }
}

// ✅ POST - Mettre à jour le statut de la room
export async function POST(request: Request) {
  try {
    const { code, status } = await request.json();

    if (!code || !status) {
      return Response.json(
        { error: "Code et status requis" },
        { status: 400 }
      );
    }

    await connectDB();

    const room = await Room.findOne({ code: code.toUpperCase() });

    if (!room) {
      return Response.json(
        { error: "Room introuvable" },
        { status: 404 }
      );
    }

    // ✅ Vérifier que le statut est valide
    const validStatuses = ["waiting", "playing", "reviewing", "finished"];
    if (!validStatuses.includes(status)) {
      return Response.json(
        { error: `Statut invalide. Valeurs acceptées : ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    room.status = status;
    await room.save();

    return Response.json({
      message: "Statut mis à jour",
      status: room.status,
    });
  } catch (error) {
    console.error("❌ Status update error:", error);
    return Response.json(
      { error: "Impossible de mettre à jour le statut" },
      { status: 500 }
    );
  }
}