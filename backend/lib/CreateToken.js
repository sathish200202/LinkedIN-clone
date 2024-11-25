import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

//create a token
//1st one is get the specific user id from mogoDB
//2nd one is jwt secret value for generate the secret key
//3rd one is expiring time(3days)
export const CreateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });

  //set into cookie
  res.cookie("jwt-linkedin", token, {
    httpOnly: true, //prevent XSS attacks,
    maxAge: 3 * 24 * 60 * 60 * 1000,
    sameSite: "strict", //prevent CSRF attacks
    secure: process.env.NODE_ENV === "development", //prevents man-in-the-middle attacks
  });
};
