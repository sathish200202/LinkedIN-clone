import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  deleteNotification,
  getUserNotifications,
  markNotificationAsRead,
} from "../Controllers/notification.controller.js";

const router = express.Router();

//get user notification route
router.get("/", protectRoute, getUserNotifications);

//marknotificationasread route
router.put("/:id/read", protectRoute, markNotificationAsRead);

//delete notification route
router.delete("/:id", protectRoute, deleteNotification);
export default router;
