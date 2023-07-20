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
  const url = JSON.parse(localStorage.getItem(Local_Starage_Key))
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
    socket.on("mousemove", (event) => {
      ipcRenderer.send("mousemove", event);
    });

    socket.on("dblclick", (event) => {
      ipcRenderer.send("dblclick", event);
    });

    socket.on("keydown", (event) => {
      console.log(`App.js Key pressed: ${event.keyCode}`);
      ipcRenderer.send("keydown", event);
    });

    socket.on('leftClick', event => {
      console.log(`App.js leftClick : ${event}`);
      ipcRenderer.send("leftClick", event);
    })
  
    socket.on('rightClick', event => {
      console.log(`App.js rightClick : ${event}`);
      ipcRenderer.send("rightClick", event);
    })

    // socket.on("mousedown", (event) => {
    //   ipcRenderer.send("mousedown", event);
    // });

    // socket.on("scroll", (event) => {
    //   console.log(`App.js scroll: ${event.scroll}`);
    //   ipcRenderer.send("scroll", event);
    // });

    // socket.on('mouseDown', coords => {
    //   console.log(`App.js mouseDown : ${coords}`);
    //   ipcRenderer.send("mouseDown", coords);
    // })

    // socket.on('mouseUp', () => {
    //   console.log(`App.js mouseUp`);
    //   ipcRenderer.send("mouseUp");
    // })

    // socket.on('wheel', () => {
    //   console.log(`App.js wheel`);
    //   ipcRenderer.send("wheel");
    // })

    // socket.on('keydown', key => {
    //   console.log(`App.js keydown : ${key}`);
    //   ipcRenderer.send("keydown", key);
    // })

    // socket.on('keyup', key => {
    //   console.log(`App.js keyup : ${key}`);
    //   ipcRenderer.send("keyup", key);
    // })

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
