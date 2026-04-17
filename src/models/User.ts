import mongoose, { Model, Schema } from "mongoose";

export interface IUser {
  uid: string;
  name: string;
  email: string;
  phone: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  uid: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
