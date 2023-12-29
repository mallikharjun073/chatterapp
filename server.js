import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { chatmodel } from './message.schema.js';

export const app = express();
app.use(cors());

export const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"]
    }
});
const users = [];
io.on("connection", (socket) => {


    socket.on("newUserJoined", async(data) => {
        
        users.push(data);
        socket.user = data;
        const Userdata = await chatmodel.find();
        io.emit('load_data',Userdata)
        io.emit("joineduserList",users);
        const count = users.lengths
        // Join the room
        socket.join(data.room);
    });

    socket.on("new_message_received", async (data) => {
        const {username,message,room} = data;
        // write your code here
        const chatdata = new chatmodel({
            username,
            text:message,
            room: room,
            timestamp: new Date()
        });
        chatdata.save();
        // Broadcast the received message to all users in the same room
        socket.broadcast.emit("sendmessage", {
            username: data.username,
            text: data.message
        });
    });

    socket.on("userTyping", async (user) =>{
        socket.broadcast.emit("userTypingBroadcast",user);
    });
    socket.on("userTypingCompleted", async(user) =>{
        socket.broadcast.emit("userTypingCompletedBroadcast",user);
    })
    

    socket.on("disconnect", () => {
        const index = users.indexOf(socket.user)
        users.splice(index,1);
        // delete users[socket.id];
        io.emit("usersListUpdated",users);
        console.log("Connection disconnected.");
    });
});



