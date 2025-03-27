const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

app.use(cors());

let messages = [];
let users = new Set();

io.on("connection", (socket) => {
    console.log("A user connected");

    // Check if username is unique
    socket.on("checkUsername", (username, callback) => {
        if (users.has(username)) {
            callback(true); // Username taken
        } else {
            users.add(username);
            callback(false); // Username is unique
        }
    });

    // Handle new messages
    socket.on("newMessage", (message) => {
        messages.push(message);
        io.emit("chatUpdate", messages);

        // Remove message after 5 minutes
        setTimeout(() => {
            messages = messages.filter(m => m !== message);
            io.emit("chatUpdate", messages);
        }, 5 * 60 * 1000);
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
