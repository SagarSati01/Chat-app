import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const getUsersForSidebar = async (req, res) => {
    try{
        const loggedInUserId=req.user._id;
        const filteredUser=await User.find({_id:{$ne:loggedInUserId}}).select("-password");

        res.status(200).json(filteredUser);
    } catch(error){
        console.log("Error in getUsersForSidebar :",error.message);
        res.status(500).json({error:"Internal Server Error"});
    }
}

export const getMessages = async (req, res) => {
    try{
        const {id:userToChatId}=req.params;
        const myId=req.user._id;

        const messages=await Message.find({
            $or:[
                {senderId:myId,receiverId:userToChatId},
                {senderId:userToChatId, receiverId:myId}
            ]
        })
        res.status(200).json(messages);
    } catch(error){
        console.log("Error in getMessages controller :",error.message);
        res.status(500).json({error:"Internal Server Error"});
    }
};

export const sendMessage = async (req, res) => {
    try {

        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let imageUrl;

        if (image) {
            console.log("Uploading image to cloudinary:", image.slice(0,100));
            const uploadResponse = await cloudinary.uploader.upload(image, {
                folder: "chat-image",
                resource_type: "auto"
            });
            imageUrl = uploadResponse.secure_url;

        }
        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        });

        await newMessage.save();
        
        //realtime functionality goes here=> socket.io

        const receiverSocketId= getReceiverSocketId(receiverId);
        if(receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage",newMessage);
            //io.to(userId).emit()   ->  only sending to the receiver     ,  it is used on server->
            //	Sends new message to the receiver’s browser in real time.  

        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.log("Error in sendMessage controller", error.message);
        res.status(500).json({ error: "Internal Server error" })
    }
}