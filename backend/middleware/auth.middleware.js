import jwt from "jsonwebtoken";
import User from "../Models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies["jwt-linkedin"];

    //if the token is not exists handle that
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - no Token Provider" });
    }

    //decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ message: "Unathorized - Invalid Token" });
    }
    //console.log("decoded: ", decoded);

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    req.user = user;

    next();
  } catch (error) {
    console.log("Error in ProtectRoute middleware ", error.message);
    res.status(500).json({ message: "Server error ", error: error.message });
  }
};
