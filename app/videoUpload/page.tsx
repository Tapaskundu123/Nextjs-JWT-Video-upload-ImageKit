"use client";

import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { upload } from "@imagekit/next";
import Link from "next/link";

const UploadExample = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fixed: message is always a string
  const validateFile = (file: File): { valid: boolean; message: string } => {
    if (!file) return { valid: false, message: "No file selected" };
    if (!file.type.startsWith("video/"))
      return { valid: false, message: "Only video files are allowed" };
    if (file.size > 100 * 1024 * 1024)
      return { valid: false, message: "Video must be under 100MB" };
    return { valid: true, message: "File is valid" };
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Title & description check
    if (!title.trim() || !description.trim()) {
      toast.error("Please provide both title and description");
      return;
    }

    const validation = validateFile(file);
    if (!validation.valid) {
      toast.error(validation.message);
      return;
    }

    setUploading(true);
    setProgress(0);
    toast.loading("Uploading video...", { id: "upload" });

    try {
      // Step 1: Get ImageKit authentication parameters from backend
      const { data: authRes } = await axios.get("/api/auth/imagekit-auth", {
        withCredentials: true,
      });

      // Step 2: Upload directly to ImageKit (client-side with signed params)
      const uploadResponse = await upload({
        file,
        fileName: `${Date.now()}-${file.name}`,
        signature: authRes.signature,
        token: authRes.token,
        expire: authRes.expire,
        publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!, // Make sure this env is set
        folder: "/videos",
        onProgress: (event) => {
          if (event.loaded && event.total) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setProgress(percent);
          }
        },
      });

      // Step 3: Save video metadata to MongoDB
      await axios.post(
        "/api/videos",
        {
          title: title.trim(),
          description: description.trim(),
          videoUrl: uploadResponse.url,
          thumbnailUrl: `${uploadResponse.url}?tr=n-thumbnail`,
          fileId: uploadResponse.fileId, // optional: useful for future deletion
        },
        { withCredentials: true }
      );

      // Success
      toast.success("Video uploaded successfully!", { id: "upload" });

      // Reset form
      setTitle("");
      setDescription("");
      setProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      console.error("Upload failed:", err);

      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Upload failed. Please try again.";

      toast.error(errorMessage, { id: "upload" });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl w-full mx-auto p-8 bg-white rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
          Upload New Video
        </h2>

        {/* Title & Description */}
        <div className="space-y-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              placeholder="Enter a catchy title..."
              disabled={uploading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 resize-none"
              placeholder="Tell viewers what your video is about..."
              disabled={uploading}
            />
          </div>
        </div>

        {/* File Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-500 transition-colors">
          <input
            type="file"
            accept="video/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <svg
              className="mx-auto w-16 h-16 text-blue-600 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-lg font-medium text-gray-700">
              {uploading ? "Uploading your video..." : "Click to upload video"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              MP4, WebM, MOV · Max 100MB
            </p>
          </label>
        </div>

        {/* Progress Bar */}
        {uploading && (
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2 text-gray-600">
              <span>Uploading...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* View All Videos Button */}
        <div className="mt-10 text-center">
          <Link
            href="/AllVideos"
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold px-8 py-4 rounded-full hover:shadow-2xl transform hover:scale-105 transition"
          >
            View All Videos
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UploadExample;