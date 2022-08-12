const { app, BrowserWindow, desktopCapturer, screen, ipcMain } = require('electron')
const express = require("express");
const srv = express();
const port = 4000;
const robot = require("robotjs");
const Controller = require("controllerjs")
const { spawn, exec } = require("child_process")

const http = require("http");
const server = http.createServer(srv);

const io = require("socket.io")(server);
srv.use(express.static(__dirname + "/public"));

io.sockets.on("error", e => console.log(e));
server.listen(port, () => console.log(`Server is running on port ${port}`));

let broadcaster
let client = null
let master = null
let masterData = null

// const pythonProcess = spawn('python3',["controllerjs/test.py"]);

let convertAltCmd = true
let platform = process.platform

let ctrl = new Controller()

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  })
  win.webContents.openDevTools();
  win.loadFile('app.html')



  let isAltDown = false
  let isCommandDown = false
  let isControlDown = false
  let isShiftDown = false

  ipcMain.on("moveMouse", (e, d) => {
    let { width, height } = screen.getPrimaryDisplay().size
    ctrl.moveMouse(width * d.x, height * d.y)
  })

  ipcMain.on("scroll", (e, d) => {
    ctrl.scroll(d.deltaX > 0 ? 1 : -1, d.deltaY > 0 ? 1 : -1)
  })

  ipcMain.on("dblclick", (e, d) => {
    console.log(d);
    ctrl.click("dblclick", d ? "right" : "left")
  })

  ipcMain.on("mousedown", (e, d) => {
    ctrl.click("down", d ? "right" : "left")
  })

  ipcMain.on("mouseup", (e, d) => {
    ctrl.click("up", d ? "right" : "left")
  })

  ipcMain.on("keydown", (e, d) => {
    let isSpecificKey = false
    switch (d) {
      case "Alt":
        isAltDown = true
        isSpecificKey = true
        break;
      case "Meta":
        isCommandDown = true
        isSpecificKey = true
        break;
      case "Control":
        isControlDown = true
        isSpecificKey = true
        break;
      case "Shift":
        isShiftDown = true
        isSpecificKey = true
        break;
    }
    let key = []
    if (isAltDown) {
      console.log(platform);
      console.log(convertAltCmd);
      if (platform === "darwin" && convertAltCmd) {
        key.push("Meta")
      } else {
        key.push("Alt")
      }
    }
    if (isCommandDown) key.push("Meta")
    if (isControlDown) key.push("Control")
    if (isShiftDown) key.push("Shift")

    if (!isSpecificKey) {

      ctrl.press(d, key)
      // controller.press(d, key)
      // pythonProcess.stdin.write(`12345:2 analogInput ${count++}\n`);
      // robot.keyToggle(d.toLowerCase(), "down", key)
      // var chars = 'abcdefghijklmnopqrstuvwxyz1234567890,./;\'[]\\'.split('');

      // for (var x in chars) {
      //   robot.keyTap(chars[x])
      // }
      // robot.keyToggle("backspace", "down", C)
    }
  })

  ipcMain.on("keyup", (e, d) => {
    let isSpecificKey = false
    switch (d) {
      case "Alt":
        isAltDown = false
        isSpecificKey = true
        break;
      case "Meta":
        isCommandDown = false
        isSpecificKey = true
        break;
      case "Control":
        isControlDown = false
        isSpecificKey = true
        break;
      case "Shift":
        isShiftDown = false
        isSpecificKey = true
        break;
    }


    let key = []
    if (isAltDown) {
      if (platform === "darwin" && convertAltCmd) {
        key.push("Meta")
      } else {
        key.push("Alt")
      }
    }
    if (isCommandDown) key.push("Meta")
    if (isControlDown) key.push("Control")
    if (isShiftDown) key.push("Shift")


    ctrl.release(d)

    if (!isSpecificKey) {
      // robot.keyToggle(d.toLowerCase(), "up", key)
    }
  })

  desktopCapturer.getSources({ types: ['window', 'screen', 'audio'] }).then(async sources => {

    win.webContents.send('SET_SIZE', screen.getPrimaryDisplay())
    for (const source of sources) {
      if (source.name === 'Entire Screen') {
        win.webContents.send('SET_SOURCE', source.id)
        return
      }
    }
  })

}

app.allowRendererProcessReuse = true;

app.whenReady().then(() => {

  createWindow()
})

io.sockets.on("connection", socket => {
  socket.on('master', (data, callback) => {
    // controller.press("d")
    master = socket.id
    if (data.type === "offer") masterData = data
    // console.log(data);
  })

  socket.on('client', (data, callback) => {
    client = socket.id
    io.to(client).emit("data", masterData);


  })

  socket.on('clientData', (data, callback) => {
    if (data.type === "answer") {
      io.to(master).emit("data", data);
    }
    // console.log(data);
  })
});












