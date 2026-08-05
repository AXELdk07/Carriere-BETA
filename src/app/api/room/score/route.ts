import connectDB from "@/db/mongodb";
import { Room } from "@/models/Room";

export const dynamic = "force-dynamic";

interface Participant {
  name: string;
  score: number | null;
  totalQuestions: number | null;
  avgTimePerQuestion: number | null;
  done: boolean;
}

interface Answer {
  playerId: number;
  playerName: string;
  userAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const { code, playerName, score, totalQuestions, avgTimePerQuestion, answers, forceUpdate } = await request.json();

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

    const room = await Room.findOne({ code: code.toUpperCase() });

    if (!room) {
      return Response.json(
        { error: "Room introuvable. Vérifiez le code." },
        { status: 404 }
      );
    }

    if (room.status !== "playing" && room.status !== "reviewing") {
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

    // 🔥 Si le participant a déjà soumis son score et que forceUpdate n'est pas true → bloquer
    if (participant.done && !forceUpdate) {
      return Response.json(
        { error: "Vous avez déjà soumis votre score" },
        { status: 409 }
      );
    }

    // 🔥 Si forceUpdate est true, on écrase le score existant
    if (forceUpdate) {
      participant.score = score;
      participant.totalQuestions = totalQuestions;
      participant.avgTimePerQuestion = avgTimePerQuestion;
      participant.done = true;
    } else {
      // ✅ Soumission normale (première fois)
      participant.score = score;
      participant.totalQuestions = totalQuestions;
      participant.avgTimePerQuestion = avgTimePerQuestion;
      participant.done = true;
    }

    // ✅ Sauvegarder les réponses du joueur (si fournies et non vides)
    if (answers && Array.isArray(answers) && answers.length > 0) {
      // Chercher si le joueur existe déjà dans participantAnswers
      const existingIndex = room.participantAnswers?.findIndex(
        (p: any) => p.playerName === playerName.trim()
      ) ?? -1;

      const userAnswers = answers.map((a: Answer) => a.userAnswer);

      if (existingIndex >= 0) {
        // Mettre à jour les réponses existantes
        room.participantAnswers[existingIndex].answers = userAnswers;
      } else {
        // Ajouter un nouveau participant
        if (!room.participantAnswers) {
          room.participantAnswers = [];
        }
        room.participantAnswers.push({
          playerName: playerName.trim(),
          answers: userAnswers,
        });
      }
    }

    // Vérifier si tous les participants ont fini
    const allDone = room.participants.every((p: Participant) => p.done);

    // Si tous ont fini, passer en mode "reviewing"
    if (allDone) {
      room.status = "reviewing";
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