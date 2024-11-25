import User from "../Models/user.model.js";
import cloudinary from "../lib/cloudinary.js";
//get suggested Connections controller
export const getSuggestedConnections = async (req, res) => {
  const userId = req.user._id;
  //console.log("userId: ", userId);
  try {
    const currentuser = await User.findById(userId).select("connections");

    //find users who are not already connected, and also do not recommend our own profile!! right?
    const suggestUser = await User.find({
      _id: {
        $ne: req.user._id,
        $nin: currentuser.connections,
      },
    })
      .select("name username profilePicture headline")
      .limit(4);

    res.status(201).json(suggestUser);
  } catch (error) {
    console.log("Error in getSuggestedConnections controller ", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//getting publicprofile controller
export const getPublicProfile = async (req, res) => {
  const { username } = req.params;
  //console.log("params: ", req.params.username);
  try {
    const user = await User.findOne({ username }).select("-password");
    //console.log("user: ", user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(201).json(user);
  } catch (error) {
    console.log("Error in getPublicProfile controller ", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//update the user profile controller
export const updateProfile = async (req, res) => {
  try {
    const allowFields = [
      "name",
      "username",
      "headline",
      "about",
      "location",
      "profilePicture",
      "bannerImg",
      "skills",
      "experience",
      "education",
    ];

    const updateData = {};

    //set the req field to our data
    for (const field of allowFields) {
      if (req.body[field]) {
        updateData[field] = req.body[field];
      }
    }

    //todo chech for the profile img and banner img => uploaded to cloudinary

    //update profilepicture using cloudinary
    const profilePic = req.body.profilePicture;
    if (profilePic) {
      const result = await cloudinary.uploader.upload(profilePic);
      updateData.profilePicture = result.secure_url;
    }

    //update banner image using cloudinary
    const bannerimg = req.body.bannerImg;
    if (bannerimg) {
      const result = await cloudinary.uploader.upload(bannerimg);
      updateData.bannerImg = result.secure_url;
    }

    //get the current user
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true }
    ).select("-password");

    res.status(200).json({
      user: user,
      message: "Profile updated Successfully",
    });
  } catch (error) {
    console.log("Error in updateprofile controller ", error.message);
    res.status(500).json({ message: "Server error ", error: error.message });
  }
};
