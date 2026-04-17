import mongoose, { Model, Schema } from "mongoose";

interface ChatEntry {
  role: "user" | "assistant";
  content: string;
}

export interface IChat {
  userId: string;
  messages: ChatEntry[];
  updatedAt: Date;
}

const ChatSchema = new Schema<IChat>({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  messages: [
    {
      role: {
        type: String,
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
    },
  ],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Chat: Model<IChat> = mongoose.models.Chat || mongoose.model<IChat>("Chat", ChatSchema);

export default Chat;
