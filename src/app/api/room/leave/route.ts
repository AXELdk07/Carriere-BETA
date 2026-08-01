import connectDB from "@/db/mongodb";
import { Room } from "@/models/Room";

interface Participant {
  name: string;
  score: number | null;
  totalQuestions: number | null;
  avgTimePerQuestion: number | null;
  done: boolean;
}

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await connectDB();

    const { code, userName } = await request.json();
    if (!code || !userName || typeof userName !== "string" || userName.trim().length < 3) {
      return Response.json({ error: "Code et nom valides requis" }, { status: 400 });
    }

    const room = await Room.findOne({ code: code.toUpperCase() });
    if (!room) {
      return Response.json({ error: "Room introuvable" }, { status: 404 });
    }
    const leavingName = userName.trim();
    const participantIndex = room.participants.findIndex(
      (participant: Participant) => participant.name === leavingName
    );
    if (participantIndex === -1) {
      return Response.json({ error: "Joueur introuvable dans cette room" }, { status: 404 });
    }

    // ✅ Supprimer le participant
    room.participants.splice(participantIndex, 1);

    let newHostName: string | null = null;
    
    // ✅ Si plus de participants, supprimer la room
    if (room.participants.length === 0) {
      await room.deleteOne();
      return Response.json({
        message: `${leavingName} a quitté la room.`,
        roomClosed: true,
        leftPlayerName: leavingName,
      });
    }

    // ✅ Si le Host quitte, le premier participant restant devient Host
    if (room.hostName === leavingName) {
      newHostName = room.participants[0].name;
      room.hostName = newHostName;
    }

    // ✅ Si la partie est en cours et que tous ont fini, passer à "finished"
    if (
      room.status === "playing" &&
      room.participants.every((participant: Participant) => participant.done)
    ) {
      room.status = "finished";
    }

    await room.save();

    return Response.json({
      message: `${leavingName} a quitté la room.`,
      code: room.code,
      hostName: room.hostName,
      participants: room.participants.map((participant: Participant) => participant.name),
      leftPlayerName: leavingName,
      newHostName,
      roomClosed: false,
    });
  } catch (error) {
    console.error("Leave room error:", error);
    return Response.json({ error: "Impossible de quitter la room" }, { status: 500 });
  }
}