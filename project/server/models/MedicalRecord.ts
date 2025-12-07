import mongoose, { Schema } from "mongoose";

export interface IMedicalRecord {
  userId: string;
  date: string;
  type: string;
  description: string;
  attachmentName?: string;
  attachmentPath?: string;
  attachmentUrl?: string;
}

const MedicalRecordSchema = new Schema<IMedicalRecord>(
  {
    userId: { type: String, required: true, index: true },
    date: { type: String, required: true },
    type: { type: String, required: true },
    description: { type: String, required: true },
    attachmentName: { type: String },
    attachmentPath: { type: String },
    attachmentUrl: { type: String },
  },
  { timestamps: true }
);

export const MedicalRecordModel = mongoose.model<IMedicalRecord>(
  "MedicalRecord",
  MedicalRecordSchema
);
