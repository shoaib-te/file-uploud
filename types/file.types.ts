// src/types/file.types.ts

export type FileType = 'document' | 'image' | 'video' | 'audio' | 'other';

export interface SerializedFile {
  _id: string;          // Converted from Types.ObjectId / Document
  name: string;
  url: string;
  type: FileType;
  size: number;
  owner: string;        // Converted from Types.ObjectId
  extension: string;
  bucketFileId: string;
  users?: string[];
  createdAt: string;    // Converted from Date
  updatedAt: string;    // Converted from Date
}
