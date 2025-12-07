import mongoose, { Schema } from "mongoose";

export interface IAppointment {
  userId: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  location?: string;
  phoneNumber?: string;
  reminderSent?: boolean;
  externalReminderSent?: boolean;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    date: { type: String, required: true },
    time: { type: String, required: true },
    location: { type: String },
    phoneNumber: { type: String },
    reminderSent: { type: Boolean, default: false },
    externalReminderSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const AppointmentModel = mongoose.model<IAppointment>(
  "Appointment",
  AppointmentSchema
);
