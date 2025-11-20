// models/video.model.ts
import mongoose, { Document, Model } from "mongoose";

export const VIDEO_DIMENSIONS = {
  width: 1080,
  height: 1920,
} as const;

export interface IVideo extends Document {
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  controls: boolean;
  transformation: {
    height: number;
    width: number;
    quality?: number;
  };
  userId?: string; // Optional: if you want to link to user
  createdAt: Date;
  updatedAt: Date;
}

const videoSchema = new mongoose.Schema<IVideo>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: 500,
    },
    videoUrl: {
      type: String,
      required: true,
      unique: true,
    },
    thumbnailUrl: {
      type: String,
      required: true,
    },
    controls: { type: Boolean, default: true },
    transformation: {
      height: { type: Number, default: VIDEO_DIMENSIONS.height },
      width: { type: Number, default: VIDEO_DIMENSIONS.width },
      quality: { type: Number, min: 1, max: 100, default: 80 },
    },
    userId: { type: String }, // Optional: for user-specific videos
  },
  { timestamps: true }
);

// Indexes
videoSchema.index({ createdAt: -1 });

// Prevent model overwrite in Next.js dev mode
const Video: Model<IVideo> =
  mongoose.models.Video || mongoose.model<IVideo>("Video", videoSchema);

// Export both named and default
export type { IVideo };
export { Video };
export default Video;