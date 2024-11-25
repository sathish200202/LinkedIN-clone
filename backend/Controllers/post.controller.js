import cloudinary from "../lib/cloudinary.js";
import Post from "../Models/post.model.js";
import Notification from "../Models/notification.model.js";
import { sendCommentNotificationEmail } from "../emails/emailHandlers.js";

//getting all post to home controller
export const getFeedPosts = async (req, res) => {
  try {
    const posts = await Post.find({
      author: { $in: [...req.user.connections, req.user._id] },
    })
      .populate("author", "name username profilePicture headline")
      .populate("comments.user", "name profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.log("Error in getFeedPosts controller ", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//creating a post controller
export const createPost = async (req, res) => {
  try {
    const { content, image } = req.body;

    let newPost;
    if (image) {
      const imgResult = await cloudinary.uploader.upload(image);
      newPost = new Post({
        author: req.user._id,
        content,
        image: imgResult.secure_url,
      });
    } else {
      newPost = new Post({
        author: req.user._id,
        content,
      });
    }
    await newPost.save();

    res
      .status(201)
      .json({ newPost: newPost, message: "Post created successfully" });
  } catch (error) {
    console.log("Error in createPost controller ", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//deleting a post controller
export const deletePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const postId = req.params.id;

    //first we need to find the post
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post is not found" });
    }

    //check if the current user is the author of the post
    if (post.author.toString() !== userId.toString()) {
      return res
        .satus(403)
        .json({ message: "You are not authorized to delete this post" });
    }

    //if the post have image, delete the image from cloudinary
    if (post.image) {
      await cloudinary.uploader.destroy(
        post.image.split("/").pop().split(".")[0]
      );
    }

    await Post.findByIdAndDelete(postId);

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.log("Error in deletePost controller ", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//get post by ID controller
export const getPostById = async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await Post.findById(postId)
      .populate("author", "name username profilePicture headline")
      .populate("comments.user", "name profilePicture username headline");

    res.status(200).json(post);
  } catch (error) {
    console.log("Error in getPostById controller ", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//create a comment controller
export const createComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const { content } = req.body;

    const post = await Post.findByIdAndUpdate(
      postId,
      { $push: { comments: { user: req.user._id, content } } },
      { new: true }
    ).populate("author", "name email username headline profilePicture");

    //create a notification if the comment owner is not the post owner
    if (post.author._id.toString() !== req.user._id.toString()) {
      const newNotification = new Notification({
        recipient: post.author,
        type: "comment",
        relatedUser: req.user._id,
        relatedPost: postId,
      });

      await newNotification.save();

      try {
        const postUrl = process.env.CLIENT_URL + "/post" + postId;
        await sendCommentNotificationEmail(
          post.author.email,
          post.author.name,
          req.user.name,
          postUrl,
          content
        );
      } catch (error) {
        console.log(
          "Error in sendCommentNotificationEmail function ",
          error.message
        );
        res.status(400).json({
          message: "sendCommentNotificationEmail error",
          error: error.message,
        });
      }
    }

    res.status(200).json(post);
  } catch (error) {
    console.log("Error in getPostById controller ", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);
    const userId = req.user._id;

    //two logics are there..one is like and then another one is unlike
    if (post.likes.includes(userId)) {
      //unlike the post
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      //like the post
      post.likes.push(userId);

      //create a notification if the post owner is not the user who liked
      if (post.author.toString() !== userId.toString()) {
        const newNotification = new Notification({
          recipient: post.author,
          type: "like",
          relatedUser: userId,
          relatedPost: postId,
        });
        await newNotification.save();
      }
    }
    await post.save();

    res.status(200).json(post);
  } catch (error) {
    console.log("Error in likePost controller ", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
