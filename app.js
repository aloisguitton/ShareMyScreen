// In the preload script.
const { ipcRenderer } = require('electron')
const { dialog, Menu } = ipcRenderer;

let width = 0
let height = 0
ipcRenderer.on('SET_SIZE', (event, screen) => {
  width = screen.size.width
  height = screen.size.height
  let ratio = 1920 / screen.size.width
  width *= ratio
  height *= ratio
  console.log(ratio);
})

ipcRenderer.on('SET_SOURCE', async (event, sourceId) => {
  try {
    const videoStream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: sourceId,
          minWidth: width,
          maxWidth: width,
          minHeight: height,
          maxHeight: height
        }
      }
    })
    handleStream(videoStream)
    // handleStream(audioStream)
  } catch (e) {
    handleError(e)
  }
})



function handleStream(stream) {
  console.log(stream);

  var peerStream = new SimplePeer({ initiator: true, trickle: false, stream: stream })
  peerStream.on('signal', data => {
    const socket = io.connect("http://localhost:4000");

    socket.on("data", (data) => {
      peerStream.signal(data)
    })

    socket.emit('master', data, (error) => {
      console.log(data);
      if (error) {
        console.error(error)
      }
    })
  })

  peerStream.on("connect", () => {
    console.log("connected");

    setInterval(() => {
      console.log("send");
      peerStream.send(Date.now().toString())
    }, 500);
  })

  peerStream.on('data', (e, v) => {
    e = JSON.parse(e.toString())
    console.log(e);
    switch (e.type) {
      case "movemouse":
        ipcRenderer.send('moveMouse', e.value);
        break;
      case "dblclick":
        ipcRenderer.send('dblclick', !!e.right);
        break;
      case "mousedown":
        console.log(e);
        ipcRenderer.send('mousedown', !!e.right);
        break;
      case "mouseup":
        ipcRenderer.send('mouseup', !!e.right)
        break;
      case "keydown":
        ipcRenderer.send('keydown', e.key);
        break;
      case "keyup":
        ipcRenderer.send('keyup', e.key)
        break;
      case "scroll":
        ipcRenderer.send('scroll', e.value);
        break;
    }

  })

  const video = document.querySelector('video')
  video.srcObject = stream
  video.onloadedmetadata = (e) => video.play()
}



function handleError(e) {
  console.log(e)
}
