import mongoose, { Schema, Model, models } from "mongoose";

export type ReminderKind =
  | "vaccine"
  | "flea-tick"
  | "heartworm"
  | "weigh-in"
  | "vet-visit"
  | "grooming"
  | "other";

export interface IReminder {
  _id: mongoose.Types.ObjectId;
  dogId: mongoose.Types.ObjectId;
  kind: ReminderKind;
  title: string;
  dueDate: Date;
  recurDays?: number;
  completedAt?: Date;
  createdAt: Date;
}

const ReminderSchema = new Schema<IReminder>({
  dogId: {
    type: Schema.Types.ObjectId,
    ref: "Dog",
    required: true,
    index: true,
  },
  kind: {
    type: String,
    enum: [
      "vaccine",
      "flea-tick",
      "heartworm",
      "weigh-in",
      "vet-visit",
      "grooming",
      "other",
    ],
    required: true,
  },
  title: { type: String, required: true, maxlength: 120 },
  dueDate: { type: Date, required: true, index: true },
  recurDays: { type: Number, min: 1 },
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

const Reminder: Model<IReminder> =
  (models.Reminder as Model<IReminder>) ||
  mongoose.model<IReminder>("Reminder", ReminderSchema);

export default Reminder;
