import mongoose, { Schema, Model, models } from "mongoose";

export type Mood = "happy" | "normal" | "low" | "sick";
export type Appetite = "good" | "normal" | "low" | "none";

export interface IWellnessEntry {
  _id: mongoose.Types.ObjectId;
  dogId: mongoose.Types.ObjectId;
  date: Date;
  mood?: Mood;
  appetite?: Appetite;
  weight?: number;
  notes?: string;
  createdAt: Date;
}

const WellnessEntrySchema = new Schema<IWellnessEntry>({
  dogId: {
    type: Schema.Types.ObjectId,
    ref: "Dog",
    required: true,
    index: true,
  },
  date: { type: Date, required: true, index: true },
  mood: { type: String, enum: ["happy", "normal", "low", "sick"] },
  appetite: { type: String, enum: ["good", "normal", "low", "none"] },
  weight: { type: Number, min: 0 },
  notes: { type: String, maxlength: 500 },
  createdAt: { type: Date, default: Date.now },
});

const WellnessEntry: Model<IWellnessEntry> =
  (models.WellnessEntry as Model<IWellnessEntry>) ||
  mongoose.model<IWellnessEntry>("WellnessEntry", WellnessEntrySchema);

export default WellnessEntry;
