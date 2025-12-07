import mongoose, { Schema } from "mongoose";

export interface IRoutineTask {
  userId: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  category: "medication" | "exercise" | "meal" | "other";
  reminderSent?: boolean;
  externalReminderSent?: boolean;
}

const RoutineSchema = new Schema<IRoutineTask>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    date: { type: String, required: true },
    time: { type: String, required: true },
    category: {
      type: String,
      enum: ["medication", "exercise", "meal", "other"],
      default: "other",
    },
    reminderSent: { type: Boolean, default: false },
    externalReminderSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const RoutineModel = mongoose.model<IRoutineTask>(
  "RoutineTask",
  RoutineSchema
);
