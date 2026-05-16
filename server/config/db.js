import mongoose from "mongoose";

export const connectDB = async () => {
  const baseUri = process.env.MONGODB_URI?.trim();
  if (!baseUri) {
    console.warn("MONGODB_URI is missing. Server will continue with JSON-backed demo data.");
    return;
  }

  try {
    mongoose.connection.on("connected", () => console.log("Database Connected"));
    await mongoose.connect(`${baseUri}/CodeCrafters`, {
      serverSelectionTimeoutMS: 8000,
    });
  } catch (error) {
    console.warn("Database connection skipped:", error.message);
  }
};
