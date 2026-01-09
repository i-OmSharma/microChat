import mongoose, { Document, Schema } from "mongoose";

export interface IChat extends Document {
  users: string[];
  latestMessage: {
    text: string;
    sender: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const schema: Schema<IChat> = new mongoose.Schema(
  {
    users: [{ type: String, required: true }],
    latestMessage: {
      text: { type: String, default: null },
      sender: { type: String, default: null },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IChat>("Chat", schema);
