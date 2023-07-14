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
    });

    io.on("connection", function (socket) {
      socket.on("join", function (data) {
        console.log("User joined " + data);
        // Create a room for client
        socket.join(data);
      });

      socket.on("remotedisconnected", ({ remoteId }) => {
        io.to("User" + remoteId).emit("remotedisconnected");
      });

      // ------ HANDLE MOUSE AND KEY EVENTS --------
      socket.on("mousemove", ({ userId, remoteId, event }) => {
        io.to("User" + remoteId).emit("mousemove", event);
      });

      socket.on("mousedown", ({ userId, remoteId, event }) => {
        io.to("User" + remoteId).emit("mousedown", event);
      });

      // socket.on("scroll", ({ userId, remoteId, event }) => {
      //   io.to("User" + remoteId).emit("scroll", event);
      // });

      socket.on("keydown", ({ userId, remoteId, event }) => {
        io.to("User" + remoteId).emit("keydown", event);
      });

      // socket.on("event", ({ userId, remoteId, event }) => {
      //   // Detect when user presses keys on his computer and tell the changes to other user
      //   console.log(`Event sent by ${userId} to ${remoteId}`);

      //   io.to("User"+remoteId).emit("action", event);
      //   //socket.broadcast.emit("action", event);
      // });

      //New events
      socket.on('leftClick', ({ userId, remoteId, coords }) => {
        console.log(`Server leftClick: ${coords}`);
        io.to("User" + remoteId).emit("leftClick", coords);
      })

      socket.on('rightClick', ({ userId, remoteId, coords }) => {
        console.log(`Server rightClick: ${coords}`);
        io.to("User" + remoteId).emit("rightClick", coords);
      })

      // socket.on('mouseDown', coords => {
      //   console.log(`Server mouseDown: ${coords}`);
      //   io.to("User").emit("mouseDown", coords);
      // })

      // socket.on('mouseUp', () => {
      //   console.log(`Server mouseUp`);
      //   io.to("User").emit("mouseUp");
      // })

      // socket.on('scroll', delta => {
      //   console.log(`Server scroll: ${delta}`);
      //   io.to("User").emit("scroll");
      // })

      // socket.on('keyDown', key => {
      //   console.log(`App.js keyDown : ${key}`);
      //   io.to("User").emit("keyDown", key);
      // })
  
      // socket.on('keyUp', key => {
      //   console.log(`App.js keyUp : ${key}`);
      //   io.to("User").emit("keyUp", key);
      // })


});

server.listen(5000, () => {
  console.log("Server started");
});
