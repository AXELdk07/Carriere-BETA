import mongoose, { Schema, Document } from "mongoose";

export interface IPlayer extends Document {
  playerId: number;
  name: string;
  career: string[];
  createdAt: Date;
}

const PlayerSchema = new Schema<IPlayer>({
  playerId: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  career: { type: [String], required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Player = mongoose.models.Player || mongoose.model<IPlayer>("Player", PlayerSchema);