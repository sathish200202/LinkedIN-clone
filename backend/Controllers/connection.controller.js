import { sendConnectionAcceptedEmail } from "../emails/emailHandlers.js";
import ConnectionRequest from "../Models/connectionRequest.model.js";
import Notification from "../Models/notification.model.js";
import User from "../Models/user.model.js";

//send connection request controller
export const sendConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const senderId = req.user._id;

    //if you can't send a connection req to yourself
    if (senderId.toString() === userId) {
      return res
        .status(400)
        .json({ message: "You can't send a request to yourself" });
    }

    //if you have already connected to that user
    if (req.user.connections.includes(userId)) {
      return res.status(400).json({ message: "You are already connected" });
    }

    //if you have already hit a connection request
    const existingRequest = await ConnectionRequest.findOne({
      sender: senderId,
      recipient: userId,
      status: "pending",
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "A connection request already exists" });
    }

    const newRequest = new ConnectionRequest({
      sender: senderId,
      recipient: userId,
    });

    await newRequest.save();

    res.status(200).json({ message: "Connection request sent successfully" });
  } catch (error) {
    console.log("Error in sendConnectionRequest controller ", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//accept connection request controller
export const acceptConnectionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const request = await ConnectionRequest.findById(requestId)
      .populate("sender", "name email username")
      .populate("recipient", "name username");

    if (!request) {
      return res.status(404).json({ message: "Connection request not found" });
    }

    //check if the req is for the current user
    if (request.recipient._id.toString() !== userId.toString()) {
      return res
        .status(400)
        .json({ message: "Not authorized to accept this request" });
    }

    if (request.status !== "pending") {
      return res
        .status(400)
        .json({ message: "This request has already been processed" });
    }

    request.status = "accepted";
    await request.save();

    //if i am your friend then you are also my friend
    await User.findByIdAndUpdate(request.sender._id, {
      $addToSet: { connections: userId },
    });
    await User.findByIdAndUpdate(userId, {
      $addToSet: { connections: request.sender._id },
    });

    const notification = new Notification({
      recipient: request.sender._id,
      type: "connectionAccepted",
      relatedUser: userId,
    });
    await notification.save();

    res.status(200).json({ message: "Connection accepted successfully" });

    // send email
    const senderEmail = request.sender.email;
    const senderName = request.sender.name;
    const recipientName = request.recipient.name;
    const profileUrl =
      process.env.CLIENT_URL + "/profile/" + request.recipient.username;

    try {
      await sendConnectionAcceptedEmail(
        senderEmail,
        senderName,
        recipientName,
        profileUrl
      );
    } catch (error) {
      console.log("Error in sendConnectionAcceptedEmail ", error.message);
    }
  } catch (error) {
    console.log("Error in acceptConnectionRequest controller ", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//reject connection request controller
export const rejectConnectionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const request = await ConnectionRequest.findById(requestId);

    if (request.recipient.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to reject this request" });
    }

    if (request.status !== "pending") {
      return res
        .status(400)
        .json({ message: "This request has already been processed" });
    }

    request.status = "rejected";
    await request.save();

    res.status(200).json({ message: "Connection request rejected" });
  } catch (error) {
    console.log("Error in rejectConnectionRequest controller ", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//get the all connection request for a user controller
export const getConnectionRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await ConnectionRequest.find({
      recipient: userId,
      status: "pending",
    }).populate("sender", "name username profilePicture headline connections");

    res.status(200).json(requests);
  } catch (error) {
    console.log("Error in getConnectionRequests controller ", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//get all connections for a user controller
export const getUserConnections = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate(
      "connections",
      "name username profilePicture headline connections"
    );

    res.status(200).json(user.connections);
  } catch (error) {
    console.log("Error in getUserConnections controller ", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//remove the connection from the user connections controller
export const removeConnection = async (req, res) => {
  try {
    const myId = req.user._id;
    const { userId } = req.params;

    await User.findByIdAndUpdate(myId, { $pull: { connections: userId } });
    await User.findByIdAndUpdate(userId, { $pull: { connections: myId } });

    res.status(200).json({ message: "Connection removed successfully" });
  } catch (error) {
    console.log("Error in removeConnection controller ", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//get the connection status controller
export const getConnectioStatus = async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.user._id;

    const currentUser = req.user;

    if (currentUser) {
      if (currentUser.connections.includes(targetUserId)) {
        return res.status(200).json({ status: "connected" });
      }

      const pendingRequest = await ConnectionRequest.findOne({
        $or: [
          { sender: currentUserId, recipient: targetUserId },
          { sender: targetUserId, recipient: currentUserId },
        ],
        status: "pending",
      });

      if (pendingRequest) {
        if (pendingRequest.sender.toString() === currentUserId.toString()) {
          return res.status(200).json({ status: "pending" });
        } else {
          return res
            .status(200)
            .json({ status: "recieved", requestId: pendingRequest._id });
        }
      }
    }

    //if no connection or pending req found
    res.json({ status: "not_connected" });
  } catch (error) {
    console.log("Error in getConnectioStatus controller ", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
