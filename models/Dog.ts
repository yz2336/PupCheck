import mongoose, { Schema, Model, models } from "mongoose";

export interface IDog {
  _id: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  name: string;
  breed: string;
  age: number;
  weight: number;
  photoUrl?: string;
  createdAt: Date;
}

const DogSchema = new Schema<IDog>({
  ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  name: { type: String, required: true, trim: true },
  breed: { type: String, required: true, trim: true },
  age: { type: Number, required: true, min: 0 },
  weight: { type: Number, required: true, min: 0 },
  photoUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Dog: Model<IDog> =
  (models.Dog as Model<IDog>) || mongoose.model<IDog>("Dog", DogSchema);

export default Dog;
