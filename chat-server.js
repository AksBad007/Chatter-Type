const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const { join } = require("path");

app.use(express.static(__dirname + '/assets'));

app.get("/", (_req, res) => res.redirect("/terminal"));

app.get("/terminal", (_req, res) => res.sendFile(join(__dirname, '/terminal.html')));

io.on("connection", (socket) => {
    console.log("connected with", socket.id);

    // Notifying how many users are online
    io.fetchSockets()
        .then((sockets) => {
            socket.emit("intimate", (sockets.length - 1) + " other user(s) are currently online.");
            console.log(sockets.length + " user(s) currently online.");
        });

    // Socket Events
    socket.on("broadcast", (msg, cb) => {
        msg = socket.id + "> " + msg;
        socket.broadcast.emit("intimate", msg);
        cb(msg);
    });

    socket.on("disconnect", () => console.log("disconnected with", socket.id));

    socket.on("join-room", async (room_id, cb) => {
        const roomMembers = await io.in(room_id).fetchSockets();
        socket.join(room_id);
        cb("You joined room: " + room_id + "\n" + roomMembers.length + " user(s) are already in this room.\n");
        socket.to(room_id).emit("intimate", socket.id + " joined room: " + room_id);
    });

    socket.on("send-to-user-or-room", (id, msg, cb) => {
        msg = socket.id + "> " + msg;
        socket.to(id).emit("intimate", msg);
        cb(msg);
    });
});

server.listen(process.env.PORT || 3000, () => console.log("connected."));