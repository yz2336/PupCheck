import mongoose, { Schema, Model, models } from "mongoose";

export interface IChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface IChatSession {
  _id: mongoose.Types.ObjectId;
  dogId: mongoose.Types.ObjectId;
  messages: IChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IChatMessage>(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ChatSessionSchema = new Schema<IChatSession>(
  {
    dogId: { type: Schema.Types.ObjectId, ref: "Dog", required: true, index: true },
    messages: { type: [MessageSchema], default: [] },
  },
  { timestamps: true }
);

const ChatSession: Model<IChatSession> =
  (models.ChatSession as Model<IChatSession>) ||
  mongoose.model<IChatSession>("ChatSession", ChatSessionSchema);

export default ChatSession;
