import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import SessionInfo from "../../components/SessionInfo";
import SessionLoading from "../../components/SessionLoading";
import {
  setSessionMode,
  setSessionStartTime,
  setShowSessionDialog,
} from "../../states/connectionSlice";

import { ImConnection } from "react-icons/im";
import { Navigate, useNavigate } from "react-router-dom";

  const AppScreen = ({ callRef, socket, sessionEnded }) => {
  const videoRef = useRef();
  const [remoteConnecting, setRemoteConnecting] = useState(true);
  const dispatch = useDispatch();  
  const dict = require('./dict');

  const showSessionDialog = useSelector(
    (state) => state.connection.showSessionDialog
  );

  const userId = useSelector((state) => state.connection.userConnectionId);
  const remoteId = useSelector((state) => state.connection.remoteConnectionId);
  const navigate = useNavigate();

  useEffect(() => {
    // When call is accepted
    callRef.current.on("stream", function (remoteStream) {
      setRemoteConnecting(false);
      dispatch(setSessionMode(1));
      dispatch(setSessionStartTime(new Date()));
      dispatch(setShowSessionDialog(true));
      videoRef.current.srcObject = remoteStream;
      videoRef.current.play();
    });

    callRef.current.on("close", function () {
      alert("Connection closed");
      console.log("Closed");
    });

    callRef.current.on("error", function () {
      alert("Connection error");
      console.log("Error");
    });
  }, []);

  // Handling key press
  useEffect(() => {
    if (socket) {
      
      var video = document.getElementById('display');
      console.log(`Video object: ${video}`);

      class coordsAndSize {
        constructor(event, video) {
            this.x = event.clientX - video.getBoundingClientRect().left;
            this.y = event.clientY - video.getBoundingClientRect().top;
            this.videoWidth = video.getBoundingClientRect().width;
            this.videoHeight = video.getBoundingClientRect().height;
        }
      }

      // -------- MOUSE CURSOR COORDINATES -------
      let mousePos = null;
      let lastPos = null;
      // Whenever user moves cursor, save its coordinates in a variable
      document.addEventListener("mousemove", (e) => {
        mousePos = e;
      })

      // Every 100ms delay, share coordinates with connected user
      setInterval(() => {
        if (mousePos) {
          socket.emit("mousemove", {
            userId: userId,
            remoteId: remoteId,
            event: { x: mousePos.pageX, y: mousePos.pageY },
          });
        }
      }, 100)
      
      document.addEventListener("dblclick", (e) => {
        console.log(`AppScreen dblclick : ${e}`);
        e.preventDefault();
        socket.emit("dblclick", {
          userId: userId,
          remoteId: remoteId,
          event: { button: e.button },
        });
      })

      document.addEventListener("keydown", (e) => {
        console.log(`AppScreen keydown : ${e.key}`);
        e.preventDefault();

        var key = e.key;
        if (key.length !== 1 && key !== ' ') {
            key = dict[key];
        }

        console.log(`AppScreen keydown from dict: ${key}`);
        socket.emit("keydown", {
          userId: userId,
          remoteId: remoteId,
          event: { keyCode: key },
        });
      })

      document.addEventListener("keyup", (e) => {
        console.log(`AppScreen keyup : ${e.key}`);
        e.preventDefault();

        var key = e.key;
        if (key.length !== 1 && key !== ' ') {
            key = dict[key];
        }

        console.log(`AppScreen keyup from dict: ${key}`);
        socket.emit("keyup", {
          userId: userId,
          remoteId: remoteId,
          event: { keyCode: key },
        });
      })

      document.addEventListener("click", (e) => {
        console.log(`AppScreen leftClick : ${e}`);
        e.preventDefault();
        socket.emit("leftClick", {
          userId: userId,
          remoteId: remoteId,
          event: new coordsAndSize(e, video)
        });
      })

      document.addEventListener("contextmenu", (e) => {
        console.log(`AppScreen rightClick : ${e}`);
        e.preventDefault();
        socket.emit("rightClick", {
          userId: userId,
          remoteId: remoteId,
          event: new coordsAndSize(e, video)
        });
      })

      document.addEventListener("wheel", (e) => {
        console.log(`AppScreen entered wheel coordinates x & y: ${e.deltaX} & ${e.deltaY}`);
        socket.emit("wheel", {
          userId: userId,
          remoteId: remoteId,
          event: { x: e.deltaX, y: e.deltaY },
        });
        console.log(`AppScreen exited wheel coordinates x & y: ${e.deltaX} & ${e.deltaY}`);
      })

      // -------- MOUSE LMB (0), MMB (1), RMB (2) CLICK -------
      // document.addEventListener("mousedown", (e) => {
      //   socket.emit("mousedown", {
      //     userId: userId,
      //     remoteId: remoteId,
      //     event: { button: e.button },
      //   });
      // });

      // video.addEventListener("mouseDown", function (coords) {
      //   console.log(`AppScreen mouseDown : ${coords}`);
      //   socket.emit("mouseDown", new coordsAndSize(coords, video));
      // });

      // video.addEventListener('mouseup', function() {
      //   console.log(`AppScreen mouseup`);
      //   socket.emit('mouseUp');
      //   //isDraggingMouse = false;
      // })

      // window.addEventListener('keydown', function (event) {
      //   console.log(`AppScreen keydown : ${event.key}`);
      //   socket.emit('keydown', event.key)
      // })

      // window.addEventListener('keyup', function (event) {
      //   console.log(`AppScreen keyup : ${event.key}`);
      //     socket.emit('keyup', event.key)
      // })
    }
  }, [socket]);

  useEffect(() => {
    if (sessionEnded) {
      navigate("/");
      window.location.reload();
    }
  }, [sessionEnded]);

  return (
    <div className="h-screen bg-gray-700">
      <video id="display" ref={videoRef} style={{ width: "100vw", height: "100vh" }} />
      <button
        onClick={() => dispatch(setShowSessionDialog(true))}
        className="fixed flex items-center justify-center text-xl right-0 mt-5 mr-10 top-0 text-white px-4 w-auto h-12 bg-sky-600 rounded-full hover:bg-sky-500 active:shadow-lg mouse shadow transition ease-in duration-200 focus:outline-none"
      >
        <ImConnection />
        <span className="ml-2 text-lg">Session Info</span>
      </button>
      {/* {remoteConnecting && <SessionLoading />} */}
      {showSessionDialog && <SessionInfo socket={socket} />}
    </div>
  );
};

export default AppScreen;
