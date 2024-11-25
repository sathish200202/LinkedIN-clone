import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import authRoutes from "./Routes/auth.route.js";
import userRoutes from "./Routes/user.route.js";
import postRoutes from "./Routes/post.route.js";
import notificationRoutes from "./Routes/notification.route.js";
import connectionRoutes from "./Routes/connectios.route.js";

const app = express();
dotenv.config();

const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

if (process.env.NODE_ENV !== "production") {
  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    })
  );
}
app.use(express.json({ limit: "5mb" })); //parse JSON request bodies
app.use(cookieParser()); //its used to get a token from our cookies

//authentication routes
app.use("/api/v1/auth", authRoutes); //app.use() is a middleware

//user routes
app.use("/api/v1/users", userRoutes);

//post routes
app.use("/api/v1/posts", postRoutes);

//notification routes
app.use("/api/v1/notifications", notificationRoutes);

//connection routes
app.use("/api/v1/connections", connectionRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
  connectDB();
});
