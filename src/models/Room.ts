import mongoose, { Schema, Document } from "mongoose";

// Interface pour un participant (joueur humain)
export interface IRoomParticipant {
  name: string;
  score: number | null;
  totalQuestions: number | null;
  avgTimePerQuestion: number | null;
  done: boolean;
}

// Interface pour un joueur de football du quiz
export interface IRoomQuizPlayer {
  playerId: number;
  name: string;
  career: string[];
}

export interface IRoom extends Document {
  code: string;
  players: IRoomQuizPlayer[];
  hostName: string;
  participants: IRoomParticipant[];
  status: "waiting" | "playing" | "finished";
  createdAt: Date;
  updatedAt: Date;
}

const RoomParticipantSchema = new Schema<IRoomParticipant>(
  {
    name: { type: String, required: true },
    score: { type: Number, default: null },
    totalQuestions: { type: Number, default: null },
    avgTimePerQuestion: { type: Number, default: null },
    done: { type: Boolean, default: false },
  },
  { _id: false }
);

const RoomSchema = new Schema<IRoom>(
  {
    code: { type: String, required: true, unique: true }, // ✅ unique: true suffit
    players: [
      {
        playerId: { type: Number, required: true },
        name: { type: String, required: true },
        career: { type: [String], required: true },
      },
    ],
    hostName: { type: String, required: true },
    participants: { type: [RoomParticipantSchema], default: [] },
    status: {
      type: String,
      enum: ["waiting", "playing", "finished"],
      default: "waiting",
    },
    createdAt: { type: Date, default: Date.now, expires: 1800 },
  },
  {
    timestamps: true,
  }
);

// ❌ SUPPRIMER CETTE LIGNE (l'index est déjà créé par unique: true)
// RoomSchema.index({ code: 1 });

export const Room = mongoose.models.Room || mongoose.model<IRoom>("Room", RoomSchema);