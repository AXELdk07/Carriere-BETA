import mongoose, { Schema, Document } from "mongoose";

export interface IUserSession extends Document {
  sessionId: string;
  userName: string;
  startTime: Date;
  lastActivity: Date;
  currentQuestion: number;
  status: string;
}

const UserSessionSchema = new Schema<IUserSession>({
  sessionId: { type: String, required: true, unique: true },
  userName: { type: String, required: true },
  startTime: { type: Date, default: Date.now },
  lastActivity: { type: Date, default: Date.now },
  currentQuestion: { type: Number, default: 0 },
  status: { type: String, default: "active" },
});

export const UserSession = mongoose.models.UserSession || mongoose.model<IUserSession>("UserSession", UserSessionSchema);