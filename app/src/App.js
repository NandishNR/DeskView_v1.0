import React, { useEffect, useRef, useState } from "react";
import { BrowserRouter, HashRouter, Route, Routes } from "react-router-dom";
import ConnectionScreen from "./screens/connection/ConnectionScreen";
import AppScreen from "./screens/app/AppScreen";
import io from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { setShowSessionDialog } from "./states/connectionSlice";
const { ipcRenderer } = window.require("electron");
const Local_Starage_Key = 'app-info'

const App = () => {
  const callRef = useRef();
  const url = 'http://127.0.0.1:5000'; //JSON.parse(localStorage.getItem(Local_Starage_Key))
  console.log(`Initialize: ${url}`);
  const socket = io(url);
  const remoteId = useSelector((state) => state.connection.remoteConnectionId);
  const [sessionEnded, setSessionEnded] = useState(false);

  // Socket connection
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Socket connected");
    });

    socket.on("connect_error", (e) => {
      console.log("Socket connection error, retrying..." + e);
      setTimeout(() => socket.connect(), 5000);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      if (remoteId) {
        socket.emit("remotedisconnected", { remoteId: remoteId });
      }
    });

    socket.on("remotedisconnected", () => {
      //alert("Remote disconnected");
      setSessionEnded(true);
    });

    // --------- MOUSE AND KEYBOARD EVENTS ----------
    // socket.on("mousemove", (event) => {
    //   //console.log(`Mousemove: x=${event.x} y=${event.y}`);
    //   ipcRenderer.send("mousemove", event);
    // });

    // socket.on("mousedown", (event) => {
    //   console.log(`Mouse down: ${event.button}`);
    //   ipcRenderer.send("mousedown", event);
    // });

    // socket.on("scroll", (event) => {
    //   console.log(`Scroll: ${event.scroll}`);
    //   ipcRenderer.send("scroll", event);
    // });

    // socket.on("keydown", (event) => {
    //   console.log(`Key pressed: ${event.keyCode}`);
    //   ipcRenderer.send("keydown", event);
    // });

    //New events
    socket.on('leftClick', coords => {
      console.log(`App.js leftClick: ${coords}`);
      ipcRenderer.send("leftClick", coords);
    })
  
    socket.on('rightClick', coords => {
      console.log(`App.js rightClick: ${coords}`);
      ipcRenderer.send("rightClick", coords);
    })

  }, []);

  return (
    socket && (
      <HashRouter>
        <Routes>
          <Route
            path="/"
            exact
            element={<ConnectionScreen callRef={callRef} socket={socket} />}
          />
          <Route
            path="/app"
            element={
              <AppScreen
                callRef={callRef}
                socket={socket}
                sessionEnded={sessionEnded}
              />
            }
          />
          <Route
            path="*"
            element={<div>DeskViewer Error: Page not found</div>}
          />
        </Routes>
      </HashRouter>
    )
  );
};

export default App;
