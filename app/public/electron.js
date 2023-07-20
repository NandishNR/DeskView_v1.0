const path = require("path");
const { app, BrowserWindow } = require("electron");
const robot = require("robotjs");
const { desktopCapturer, ipcMain } = require("electron");
const dict = require('./dict');

    let win;
    function createWindow() {
      win = new BrowserWindow({
        width: 600,
        height: 600,
        icon: __dirname + "/img/deskviewer_logo_256.png",
        autoHideMenuBar: true,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
        },
      });

      //win.loadURL("http://localhost:3000")
      win.loadURL(`file://${path.join(__dirname, "../build/index.html")}`)
      .then(() => {
        console.log("Window loaded, URL: " + win.webContents.getURL());
        desktopCapturer.getSources({ types: ["screen"] })
          .then(async (sources) => {
            for (const source of sources) {
              // TODO: Add if condition for multiple sources
              console.log("Sources available: " + source.id);
              console.log("Source id sent: " + source.id);
              win.webContents.send("SET_SOURCE", source.id);
            }
          });
      });
    }

    app.whenReady().then(createWindow);

    app.on("window-all-closed", () => {
      if (process.platform !== "darwin") {
        app.quit();
      }
    });

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });

    // --------- HANDLE KEYBOARD AND MOUSE EVENTS -------
    ipcMain.on("mousemove", (event, args) => {
      robot.moveMouseSmooth(args.x, args.y);
    });

    ipcMain.on("dblclick", (event, args) => {
      robot.mouseClick('left', true);
    });

    ipcMain.on("keydown", (event, args) => {
      //TODO: Handle modifiers keys
      robot.keyTap(args.keyCode);
    });

    ipcMain.on("leftClick", (event, args) => {
      robot.mouseClick('left');
    });

    ipcMain.on("rightClick", (event, args) => {
      robot.mouseClick('right');
    });

    // function convertCoord(coords, xy) {
    //   if (xy === 'x') {
    //       const xVal= (robot.getScreenSize().width * coords.x) / coords.videoWidth;
    //       return xVal;
    //   } else if (xy === 'y') {
    //     const yVal = (robot.getScreenSize().height * coords.y) / coords.videoHeight;
    //       return yVal;
    //   } else {
    //       return;
    //   }
    // }

    // ipcMain.on("mousedown", (event, args) => {
    //   console.log(`Mouse down: ${args.button}`);
    //   robot.mouseClick();
    // });

    // ipcMain.on("scroll", (event, args) => {
    //   robot.scrollMouse(0, args.scroll);
    // });

    // ipcMain.on('mouseDown', coords => {
    //   robot.moveMouse(convertCoord(coords, 'x'), convertCoord(coords, 'y'));
    //   robot.mouseToggle('down');
    // })

    // ipcMain.on('mouseUp', () => {
    //   robot.mouseToggle('up');
    // })

    // ipcMain.on('scroll', delta => {
    //   robot.scrollMouse(delta.x, delta.y);
    // })

    // ipcMain.on('keydown', key => {
    //   if (key.length !== 1 && key !== ' ') {
    //       key = dict[key];
    //   }

    //   try {
    //       robot.keyToggle(key, 'down');
    //     } catch (err) {
    //         console.log('error', err);
    //     }
    //   })

    //   ipcMain.on('keyup', key => {
    //       if (key.length !== 1 && key !== ' ') {
    //           key = dict[key];
    //       }

    //       try {
    //           robot.keyToggle(key, 'up');
    //       } catch (err) {
    //           console.log('error', err);
    //       }
    //   })