import React, { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils.js";

const ChatContainer = () => {
  const { messages, getMessages, isMessagesLoading, selectedUser,subscribeToMessages,unsubscribeFromMessages} =   useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  const [popupImage, setPopupImage] = useState(null);


  useEffect(() => {
    getMessages(selectedUser._id);

    subscribeToMessages();
    
    return () => unsubscribeFromMessages()   //cleanup -> ensures you have only ONE active listener at a time.


  }, [selectedUser._id, getMessages,subscribeToMessages,unsubscribeFromMessages]);

  useEffect(()=>{
    if(messageEndRef.current && messages){
      messageEndRef.current.scrollIntoView({behaviour:"smooth"});
    }
  },[messages])
  
  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${ message.senderId === authUser._id ? "chat-end" : "chat-start" }`}
            ref={messageEndRef}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1"> {formatMessageTime(message.createdAt)} </time>
            </div>
            <div className={`chat-bubble flex flex-col ${message.senderId === authUser._id && "bg-primary text-primary-content"}
            ${message.senderId!==authUser._id && "shadow-sm bg-base-200"}`}>
              {message.image && (
                // <img src={message.image} alt="Attachment" className="sm:max-w-[200px] rounded-md mb-2"/>
                <img src={message.image} alt="Attachment" className="sm:max-w-[200px] rounded-md mb-2 cursor-pointer hover:opacity-90 transition"
                 onClick={() => setPopupImage(message.image)} // updated
                />

              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
      </div>

      <MessageInput />
      {popupImage && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50"
          onClick={() => setPopupImage(null)}
        >
          <img src={popupImage} alt="Full size" 
            className="max-h-[90%] max-w-[90%] rounded shadow-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <button 
            onClick={() => setPopupImage(null)} 
            className="absolute top-4 right-6 text-white text-3xl font-bold"
          >
            &times;
          </button>
        </div>
)}


    </div>
  );
};

export default ChatContainer;
