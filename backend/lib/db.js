import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI);
    console.log("DB connected successfully ");
  } catch (error) {
    console.log("Error in conneting db ", error.message);
    process.exit(1);
  }
};
