const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const path = require("path");

app.use(express.static(__dirname + '/assets'));

app.get("/", (_req, res) => res.redirect("/terminal"));

app.get("/terminal", (_req, res) => res.sendFile(path.join(__dirname, '/terminal.html')));

io.on("connection", socket => {
    console.log("connected with", socket.id);

    socket.on("broadcast", (msg, cb) => {
        socket.broadcast.emit("intimate", socket.id + " said " + msg);
        cb("You said " + msg);
    });

    socket.on("disconnect", () => console.log("disconnected with", socket.id));

    socket.on("join-room", (room_id, cb) => {
        socket.join(room_id);
        cb("You joined room: " + room_id);
        socket.to(room_id).emit("intimate", socket.id + " joined room: " + room_id);
    });

    socket.on("send-to-user-or-room", (id, msg, cb) => {
        socket.to(id).emit("intimate", socket.id + " said " + msg);
        cb("You said " + msg);
    });
});

server.listen(process.env.PORT || 3000, () => console.log("connected."));