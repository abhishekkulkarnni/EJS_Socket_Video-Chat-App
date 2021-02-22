// Root path
const socket = io("/");
const videoGrid = document.getElementById("video-grid");

//' Create dynamic peer id for each user to use WebRTC.
//' PeerJS wraps the browser's WebRTC implementation to provide a complete, configurable, and easy-to-use peer-to-peer connection API.
//' With WebRTC, you can add real-time communication capabilities to your application.
//' Pass 1st arg 'undefined', so PeerJS will generate ID automatically.
var myPeer = new Peer(undefined, {
  host: "/",
  port: "3001",
});

const myVideo = document.createElement("video");
myVideo.muted = true;

//' To keep tract of all users
const peers = {};

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    addVideoStream(myVideo, stream);

    //' Answer someone's call by sending our stream
    myPeer.on("call", (call) => {
      //' Answer caller with video stream
      call.answer(stream);

      //' Get callers video stream
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    //' Listen 'user-connected' event
    socket.on("user-connected", (userId) => {
      console.log("User Connected: " + userId);
      connectToNewUser(userId, stream);
    });

    //' Listen 'user-disconnected' event
    socket.on("user-disconnected", (userId) => {
      console.log("User Disconnected: " + userId);

      //' Remove connection
      if (peers[userId]) peers[userId].close();
    });
  });

myPeer.on("open", (id) => {
  //' Call server event with dyanmic user id by peerJS
  //' ROOM_ID passed by UUID & 'room.ejs'
  socket.emit("join-room", ROOM_ID, id);
});

//' Connect new user to existing stream
function connectToNewUser(userId, stream) {
  //' Get new user joined by passing host video stream
  const call = myPeer.call(userId, stream);
  const video = document.createElement("video");

  //' Get new user stream & Add to "#video-box"
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });

  call.on("close", () => {
    video.remove();
  });

  peers[userId] = call;
}

//' Add video stream
function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
}
