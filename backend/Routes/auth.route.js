//get the express router
import express from "express";
import {
  getCurrentUser,
  Login,
  Logout,
  SignUp,
} from "../Controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

//creae a end points for our auth

router.post("/signup", SignUp); //signup route

router.post("/login", Login); //login route

router.post("/logout", Logout); //logout route

router.get("/me", protectRoute, getCurrentUser); //getting my data

//export our router
export default router;
