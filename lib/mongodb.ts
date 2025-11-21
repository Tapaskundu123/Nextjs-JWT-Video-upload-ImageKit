// lib/mongodb.ts
import mongoose from "mongoose";

// Optional: Prevent multiple connections in development (hot reload)
const cachedConnection = global.mongoose || { conn: null, promise: null };

export const connectDB = async (): Promise<void> => {
  // If already connected, reuse the connection
  if (cachedConnection.conn) {
    console.log("Using existing MongoDB connection");
    return;
  }

  // Throw a clear error if env variable is missing (helps catch mistakes early)
  if (!process.env.MONGODB_URI) {
    console.error("❌ MONGODB_URI is not defined in .env.local");
    throw new Error("Please define MONGODB_URI in your .env.local file");
  }

  try {
    // Use cached promise to avoid multiple connections during dev
    if (!cachedConnection.promise) {
      const opts = {
        bufferCommands: false, // Disable mongoose buffering
      };

      cachedConnection.promise = mongoose.connect(process.env.MONGODB_URI!, opts);
    }

    cachedConnection.conn = await cachedConnection.promise;

    const connection = mongoose.connection;

    connection.on("connected", () => {
      console.log("✅ MongoDB connected successfully");
    });

    connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
      process.exit(1);
    });

    connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
    });

    // Save to global for next time (important in Next.js dev mode)
    global.mongoose = cachedConnection;
  } catch (error: any) {
    console.error("Failed to connect to MongoDB:", error.message);
    throw new Error(`Database connection failed: ${error.message}`);
  }
};

// Optional: Type augmentation for Node.js global (recommended)
declare global {
  // eslint-disable-next-line no-var
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}