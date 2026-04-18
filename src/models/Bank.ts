import mongoose, { Model, Schema } from "mongoose";

export interface IBank {
  name: string;
  interestRate: number;
}

const bankSchema = new Schema<IBank>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    interestRate: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Bank: Model<IBank> =
  mongoose.models.Bank || mongoose.model<IBank>("Bank", bankSchema);

export default Bank;

