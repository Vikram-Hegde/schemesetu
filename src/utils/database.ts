import mongoose from "mongoose";

let isConnected = false;

export const connectToDatabase = async () => {
  mongoose.set("strictQuery", true);
  if (isConnected) {
    console.log("mongodb is already connected");
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI!, {
      dbName: process.env.MONGODB_DB,
    });
    isConnected = true;
    console.log("mongodb is connected");
  } catch (err) {
    console.log(err);
  }
};
