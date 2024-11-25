import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  acceptConnectionRequest,
  getConnectionRequests,
  getConnectioStatus,
  getUserConnections,
  rejectConnectionRequest,
  removeConnection,
  sendConnectionRequest,
} from "../Controllers/connection.controller.js";

const router = express.Router();

//send connection request route
router.post("/request/:userId", protectRoute, sendConnectionRequest);

// accept connection request
router.put("/accept/:requestId", protectRoute, acceptConnectionRequest);

//reject connection request
router.put("/reject/:requestId", protectRoute, rejectConnectionRequest);

//get the all connection request for the current user
router.get("/requests", protectRoute, getConnectionRequests);

//get all connections for a user
router.get("/", protectRoute, getUserConnections);

//remove the connection from the user connections
router.delete("/:userId", protectRoute, removeConnection);

//get the connection status
router.get("/status/:userId", protectRoute, getConnectioStatus);

export default router;
