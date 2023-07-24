const express = require("express");
const app = express();
const socketIo = require("socket.io");
const server = require("http").createServer(app);

    // --------- UNCOMMENT THIS IF YOU WANT TO USE A PEER SERVER ------------
    //const ExpressPeerServer = require("peer").ExpressPeerServer;
    // app.use(
    //   "/peerjs",
    //   ExpressPeerServer(server, {
    //     debug: true,
    //   })
    // );

    const io = socketIo(server, {
      cors: {
        origin: "*",
      },
    })

    app.get("/api/sync_time", (req, res) => {
      res.send([new Date().toISOString()]);
    })

    io.on("connection", function (socket) {
      socket.on("join", function (data) {
        console.log("User joined " + data);
        // Create a room for client
        socket.join(data);
      })

      socket.on("remotedisconnected", ({ remoteId }) => {
        io.to("User" + remoteId).emit("remotedisconnected");
      })

      // ------ HANDLE MOUSE AND KEY EVENTS --------
      socket.on("mousemove", ({ userId, remoteId, event }) => {
        io.to("User" + remoteId).emit("mousemove", event);
      })

      socket.on("dblclick", ({ userId, remoteId, event }) => {
        io.to("User" + remoteId).emit("dblclick", event);
      })

      socket.on("keydown", ({ userId, remoteId, event }) => {
        io.to("User" + remoteId).emit("keydown", event);
      })

      socket.on("keyup", ({ userId, remoteId, event }) => {
        io.to("User" + remoteId).emit("keyup", event);
      })

      socket.on("leftClick", ({ userId, remoteId, event }) => {
        console.log(`Server leftClick: ${event}`);
        io.to("User" + remoteId).emit("leftClick", event);
      })

      socket.on("rightClick", ({ userId, remoteId, event }) => {
        console.log(`Server rightClick: ${event}`);
        io.to("User" + remoteId).emit("rightClick", event);
      })

      socket.on("wheel", ({ userId, remoteId, event }) => {
        console.log(`Server wheel: ${event}`);
        io.to("User" + remoteId).emit("wheel", event);
      })

      // socket.on("mousedown", ({ userId, remoteId, event }) => {
      //   io.to("User" + remoteId).emit("mousedown", event);
      // });

      // socket.on("event", ({ userId, remoteId, event }) => {
      //   // Detect when user presses keys on his computer and tell the changes to other user
      //   console.log(`Event sent by ${userId} to ${remoteId}`);

      //   io.to("User"+remoteId).emit("action", event);
      //   //socket.broadcast.emit("action", event);
      // });

      // socket.on('mouseDown', coords => {
      //   console.log(`Server mouseDown: ${coords}`);
      //   io.to("User").emit("mouseDown", coords);
      // })

      // socket.on('mouseUp', () => {
      //   console.log(`Server mouseUp`);
      //   io.to("User").emit("mouseUp");
      // })

      // socket.on('keydown', key => {
      //   console.log(`App.js keydown : ${key}`);
      //   io.to("User").emit("keydown", key);
      // })
  
      // socket.on('keyup', key => {
      //   console.log(`App.js keyup : ${key}`);
      //   io.to("User").emit("keyup", key);
      // })

});

server.listen(5000, () => {
  console.log("Server started");
});
