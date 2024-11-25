import User from "../Models/user.model.js";
import bcrypt from "bcryptjs";
import { CreateToken } from "../lib/CreateToken.js";
import { sendWelcomeEmail } from "../emails/emailHandlers.js";

//signup controller
export const SignUp = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    //find the user already exist based on email
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "User already exists" });
    }

    //find the username already exist based on the username
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists" });
    }

    //if the password is weak indicate to user
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    //hash the password before storing to db
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      username,
      email,
      password: hashedPassword,
    });

    //save to db
    await user.save();

    await CreateToken(res, user._id);
    // //create a token
    // //1st one is get the specific user id from mogoDB
    // //2nd one is jwt secret value for generate the secret key
    // //3rd one is expiring time(3days)
    // const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    //   expiresIn: "3d",
    // });

    // //set into cookie
    // res.cookie("jwt-linkedin", token, {
    //   httpOnly: true, //prevent XSS attacks,
    //   maxAge: 3 * 24 * 60 * 60 * 1000,
    //   sameSite: "strict", //prevent CSRF attacks
    //   secure: process.env.NODE_ENV === "development", //prevents man-in-the-middle attacks
    // });

    res.status(201).json({
      user: {
        name,
        username,
        email,
        password,
      },
      message: "User Register Successfully",
    });

    //todo: send welcome email
    //the client_url is a react application
    const profileUrl = process.env.CLIENT_URL + "/profile/" + user.username;

    try {
      await sendWelcomeEmail(user.email, user.name, profileUrl);
    } catch (emailError) {
      console.error("Error in sending welcome email ", emailError);
    }
  } catch (error) {
    console.log("Error in Signup Controller ", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//login Controller
export const Login = async (req, res) => {
  try {
    //get the username and password from request
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    //find the user from database
    const user = await User.findOne({ username });

    //handle if the user is not
    if (!user) {
      return res.status(400).json({ message: "Invalid crendentials" });
    }

    //check the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid crendentials" });
    }

    //create token
    await CreateToken(res, user._id);

    res.status(201).json({ user: user, message: "Login successfully" });
  } catch (error) {
    console.log("Error in login Controller ", error.message);
    res.status(500).json({ message: "Server error ", error: error.message });
  }
};

//logout controller
export const Logout = (req, res) => {
  try {
    res.clearCookie("jwt-linkedin");
    res.clearCookie("jwt");
    res.status(201).json({ message: "Logout successfully" });
  } catch (error) {
    console.log("Error in logout Controller ", error.message);
    res.status(500).json({ message: "Server error ", error: error.message });
  }
};

//get the current user
export const getCurrentUser = async (req, res) => {
  try {
    res.status(201).json(req.user);
  } catch (error) {
    console.log("Error in getcurrentuser controller ", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
