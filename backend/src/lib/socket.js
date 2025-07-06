import {Server } from 'socket.io';
import http from 'http';
import express from 'express';

const app=express();
const server=http.createServer(app);

const io=new Server(server,{
    cors:{
        origin:["http://localhost:5173"],
    },
});

export function getReceiverSocketId(userId){    //helper function
    return userSocketMap[userId];
}

//used to store online users
const userSocketMap={}; //{userId:socketId}

io.on("connection",(socket)=>{
    console.log("A user connected", socket.id);

    const userId=socket.handshake.query.userId;
    if(userId) 
        userSocketMap[userId]=socket.id

    //io.emit() is used to broadcast 
    io.emit("getOnlineUsers",Object.keys(userSocketMap));
    // io.emit("getOnlineUsers", ...) sends an array of currently online user IDs to all connected clients

    socket.on("disconnect",()=>{
        console.log("A user disconnected", socket.id);
        
        delete userSocketMap[userId];
        io.emit("getOnlineUsers",Object.keys(userSocketMap))
    });
})

export {io,app,server};






// Method	                 Where used	   Purpose

// io.on("connection", cb)	 Server	       Handle new connections
// socket.on("event", cb)	 Both	       Listen for events
// socket.emit("event",data) Both	       Send event to other side
// io.emit("event", data)	 Server	       Broadcast to all clients
// socket.connect()	         Client	       Manually start connection
// socket.disconnect()	     Client	       Manually stop connection
// socket.handshake.query	 Server	       Get connection query params
