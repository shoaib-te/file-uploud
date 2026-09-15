import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type FileType = 'document' | 'image' | 'video' | 'audio' | 'other';

export interface IFile extends Document {
  name: string;
  url: string;
  type?:FileType;
  size: number;
  owner: Types.ObjectId; // References User
  extension: string;
  bucketFileId: string;
  users?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const FileSchema = new Schema<IFile>(
  {
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true },
    type: { 
      type: String, 
      required: true, 
    },
    size: { type: Number, required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    extension: { type: String, required: true },
    bucketFileId: { type: String, required: true },
    users: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

export const File: Model<IFile> = mongoose.models.File || mongoose.model<IFile>('File', FileSchema);
