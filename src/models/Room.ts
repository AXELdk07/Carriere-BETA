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

// Interface pour une correction
export interface ICorrection {
  playerName: string;
  questionIndex: number;
  isCorrect: boolean; // true = vert, false = rouge
}

// Interface pour les réponses d'un participant
export interface IParticipantAnswers {
  playerName: string;
  answers: string[];
}

export interface IRoom extends Document {
  code: string;
  players: IRoomQuizPlayer[];
  hostName: string;
  participants: IRoomParticipant[];
  status: "waiting" | "playing" | "finished" | "reviewing";
  corrections: ICorrection[];
  allVerified: boolean;
  participantAnswers?: IParticipantAnswers[]; // ✅ Optionnel
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
    code: { type: String, required: true, unique: true },
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
      enum: ["waiting", "playing", "finished", "reviewing"],
      default: "waiting",
    },
    corrections: {
      type: [
        {
          playerName: { type: String, required: true },
          questionIndex: { type: Number, required: true },
          isCorrect: { type: Boolean, required: true },
        },
      ],
      default: [],
    },
    allVerified: { type: Boolean, default: false },
    participantAnswers: {
      type: [
        {
          playerName: { type: String, required: true },
          answers: { type: [String], required: true },
        }
      ],
      default: [],
      required: false, // ✅ Optionnel
    },
    createdAt: { type: Date, default: Date.now, expires: 1800 },
  },
  {
    timestamps: true,
  }
);

RoomSchema.index({ code: 1 });

export const Room = mongoose.models.Room || mongoose.model<IRoom>("Room", RoomSchema);