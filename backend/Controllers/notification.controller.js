import Notification from "../Models/notification.model.js";

//get user notification controller
export const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .populate("relatedUser", "name username profilePicture")
      .populate("relatedPost", "content image");

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error in getUserNotifications controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//mark notification as read controller
export const markNotificationAsRead = async (req, res) => {
  const notificationId = req.params.id;
  try {
    const notification = await Notification.findByIdAndUpdate(
      { _id: notificationId, recipient: req.user._id },
      { read: true },
      { new: true }
    );

    res.status(200).json(notification);
  } catch (error) {
    console.log("Error in getUserNotifications controller ", error.message);
    res.status(500).json({ message: "server error", error: error.message });
  }
};

//delete notification controller
export const deleteNotification = async (req, res) => {
  const notificationId = req.params.id;

  try {
    await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: req.user._id,
    });

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.log("Error in getUserNotifications controller ", error.message);
    res.status(500).json({ message: "server error", error: error.message });
  }
};
