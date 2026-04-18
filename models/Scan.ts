import mongoose, { Schema, Model, models } from "mongoose";

export type ScanType = "poop" | "ears" | "teeth" | "skin" | "eyes";
export type Severity = "green" | "yellow" | "red";
export type Urgency = "routine" | "soon" | "urgent";

export interface IScanAIResult {
  severity: Severity;
  title: string;
  summary: string;
  concerns: string[];
  recommendations: string[];
  shouldSeeVet: boolean;
  urgency: Urgency;
}

export interface IScan {
  _id: mongoose.Types.ObjectId;
  dogId: mongoose.Types.ObjectId;
  scanType: ScanType;
  imageUrl: string;
  aiResult: IScanAIResult;
  createdAt: Date;
}

const AIResultSchema = new Schema<IScanAIResult>(
  {
    severity: { type: String, enum: ["green", "yellow", "red"], required: true },
    title: { type: String, required: true },
    summary: { type: String, required: true },
    concerns: { type: [String], default: [] },
    recommendations: { type: [String], default: [] },
    shouldSeeVet: { type: Boolean, default: false },
    urgency: {
      type: String,
      enum: ["routine", "soon", "urgent"],
      default: "routine",
    },
  },
  { _id: false }
);

const ScanSchema = new Schema<IScan>({
  dogId: { type: Schema.Types.ObjectId, ref: "Dog", required: true, index: true },
  scanType: {
    type: String,
    enum: ["poop", "ears", "teeth", "skin", "eyes"],
    required: true,
  },
  imageUrl: { type: String, required: true },
  aiResult: { type: AIResultSchema, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Scan: Model<IScan> =
  (models.Scan as Model<IScan>) || mongoose.model<IScan>("Scan", ScanSchema);

export default Scan;
