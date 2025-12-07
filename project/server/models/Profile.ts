import mongoose, { Schema } from "mongoose";

export interface IProfile {
  userId: string;
  email: string;
  fullName?: string;
  role: "caretaker" | "patient";
  isProfileComplete: boolean;
  phoneNumber?: string;
}

const ProfileSchema = new Schema<IProfile>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true },
    fullName: { type: String },
    role: {
      type: String,
      enum: ["caretaker", "patient"],
      default: "caretaker",
    },
    isProfileComplete: { type: Boolean, default: false },
    phoneNumber: { type: String },
  },
  { timestamps: true }
);

export const ProfileModel = mongoose.model<IProfile>("Profile", ProfileSchema);
