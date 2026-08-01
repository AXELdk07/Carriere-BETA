import mongoose, { Schema, Document } from "mongoose";

export interface IAnswer {
  playerId: number;
  playerName: string;
  userAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
}

export interface IQuizResult extends Document {
  sessionId: string;
  userName: string;
  answers: IAnswer[];
  score: number;
  totalQuestions: number;
  completedAt: Date;
}

const QuizResultSchema = new Schema<IQuizResult>(
  {
    sessionId: { type: String, required: true },
    userName: { type: String, required: true },
    answers: {
      type: [
        {
          playerId: { type: Number, required: true },
          playerName: { type: String, required: true },
          userAnswer: { type: String, required: true },
          isCorrect: { type: Boolean, required: true },
          timeSpent: { type: Number, required: true },
        },
      ],
      required: true,
      default: [],
    },
    score: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 10 },
    completedAt: { type: Date, default: Date.now },
  },
  {
    // Désactiver la validation stricte pour les tableaux d'objets
    strict: false,
  }
);

export const QuizResult =
  mongoose.models.QuizResult || mongoose.model<IQuizResult>("QuizResult", QuizResultSchema);