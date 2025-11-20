"use client";

import React, { useRef, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import {
  upload,

} from "@imagekit/next";
import Link from "next/link";
// Remove ImageKit client init from client-side (see security note below)
// import ImageKit from "imagekit"; // ← COMMENT OUT – don't expose private key on client

const UploadExample = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File) => {
    if (!file) return { valid: false, message: "No file selected" };
    if (!file.type.startsWith("video/"))
      return { valid: false, message: "Only video files allowed" };
    if (file.size > 100 * 1024 * 1024)
      return { valid: false, message: "Max 100MB" };
    return { valid: true };
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!title.trim() || !description.trim()) {
      toast.error("Title and description are required");
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

    let uploadedFileId: string | null = null;

    try {
      // Step 1: Get ImageKit auth
      const { data: authRes } = await axios.get("/api/auth/imagekit-auth", {
        withCredentials: true,
      });

      // Step 2: Upload to ImageKit
      const uploadResponse = await upload({
        file,
        fileName: file.name,
        signature: authRes.signature,
        token: authRes.token,
        expire: authRes.expire,
        publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY!,
        folder: "/videos",
        onProgress: (event) => {
          const percent = Math.round((event.loaded / event.total) * 100);
          setProgress(percent);
        },
      });

      uploadedFileId = uploadResponse.fileId; // For potential rollback

      // Step 3: Save to MongoDB (FIXED: Use correct endpoint)
      const dbResponse = await axios.post(
        "/api/videos",  // ← FIXED: Plural "videos" to match your route file
        {
          title,
          description,
          videoUrl: uploadResponse.url,
          thumbnailUrl: `${uploadResponse.url}?tr=n-thumbnail`,
          transformation: { height: 1920, width: 1080, quality: 80 },
        },
        { withCredentials: true }
      );

      if (dbResponse.data) {
        console.log("MongoDB response:", dbResponse.data); // For debugging
      }

      // Success: everything worked
      toast.success("Video uploaded & saved!", { id: "upload" });
      setTitle("");
      setDescription("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      console.error("Upload error:", err);

      const msg =
        err.response?.data?.message ||
        err.message ||
        "Upload failed – video removed from storage";
      toast.error(msg, { id: "upload" });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-2xl w-full mx-auto p-8 bg-white rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
          Upload New Video
        </h2>

        {/* Title & Description */}
        <div className="space-y-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Enter title..."
              disabled={uploading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 resize-none"
              placeholder="Describe your video..."
              disabled={uploading}
            />
          </div>
        </div>

        {/* Upload Zone */}
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-500 transition">
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
            <svg className="mx-auto w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="mt-4 text-lg font-medium text-gray-700">
              {uploading ? "Uploading..." : "Click to upload video"}
            </p>
            <p className="text-sm text-gray-500">MP4, WebM · Max 100MB</p>
          </label>
        </div>

        {/* Progress */}
        {uploading && (
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Uploading</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-full rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* View All Videos */}
        <div className="mt-10 text-center">
          <Link
            href="/AllVideos"
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold px-8 py-4 rounded-full hover:shadow-xl transition"
          >
            View All Videos
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UploadExample;