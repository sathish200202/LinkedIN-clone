import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getPublicProfile,
  getSuggestedConnections,
  updateProfile,
} from "../Controllers/user.controller.js";

const router = express.Router();

//get suggestion connections route
router.get("/suggestions", protectRoute, getSuggestedConnections);

//getting the public profile
router.get("/:username", protectRoute, getPublicProfile);

//update the user profile
router.put("/profile", protectRoute, updateProfile);
export default router;
