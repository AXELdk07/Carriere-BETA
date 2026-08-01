import mongoose, { Schema, Document } from "mongoose";

export interface ILeaderboard extends Document {
  userName: string;
  score: number;
  totalQuestions: number;
  avgTimePerQuestion: number | null;
  completedAt: Date;
}

const LeaderboardSchema = new Schema<ILeaderboard>({
  userName: { type: String, required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, default: 10 },
  avgTimePerQuestion: { type: Number, default: null },
  completedAt: { type: Date, default: Date.now },
});

export const Leaderboard = mongoose.models.Leaderboard || mongoose.model<ILeaderboard>("Leaderboard", LeaderboardSchema);