import mongoose, { Model, Schema } from 'mongoose';

export interface IBooking {
  userId: string;
  bankName: string;
  amount: number;
  tenor: string;
  interestRate: number;
  maturityAmount: number;
  transactionId: string;
  status: string;
  createdAt: Date;
}

const BookingSchema = new Schema<IBooking>({
  userId: {
    type: String,
    required: true,
  },
  bankName: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  tenor: {
    type: String,
    required: true,
  },
  interestRate: {
    type: Number,
    required: true,
  },
  maturityAmount: {
    type: Number,
    required: true,
  },
  transactionId: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    default: 'COMPLETED',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;
