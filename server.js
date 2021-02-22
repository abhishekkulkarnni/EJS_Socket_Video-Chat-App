const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { v4: uuidV4 } = require("uuid");

//' Use EJS View Engine
app.set("view engine", "ejs");
app.use(express.static("public"));

//' Routes
app.get("/", (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

//' Socket server event
io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    console.log(`_RoomId: ${roomId} _UserId: ${userId}`);

    //' User Join
    socket.join(roomId);
    //' Send broadcast messsage to other users
    socket.to(roomId).broadcast.emit("user-connected", userId);

    //' User disconnect event
    socket.on("disconnect", () => {
      socket.to(roomId).broadcast.emit("user-disconnected", userId);
    });
  });
});

server.listen(3000);
