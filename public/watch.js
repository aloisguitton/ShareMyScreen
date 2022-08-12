let peerConnection;
const config = {
    iceServers: [
        {
            "urls": "stun:stun.l.google.com:19302",
        },
        // { 
        //   "urls": "turn:TURN_IP?transport=tcp",
        //   "username": "TURN_USERNAME",
        //   "credential": "TURN_CREDENTIALS"
        // }
    ]
};

var peer1 = new SimplePeer({ trickle: false })



console.log(peer1);
const socket = io.connect(window.location.origin);

socket.emit('client')

socket.on("data", (data) => {
    console.log(data);
    peer1.signal(data)
})


peer1.on('signal', data => {
    socket.emit('clientData', data, (error) => {
        if (error) {
            console.error(error)
        }
    })
})

peer1.on("connect", () => {
    const video = document.querySelector('video')
    video.addEventListener("mousemove", (e) => {
        let { width, height, x, y } = document.querySelector('video').getClientRects()[0]
        width -= x
        height -= y
        let d = { x: (e.offsetX - (e.clientX - e.offsetX) / 2) / width, y: (e.offsetY) / height }
        peer1.send(JSON.stringify({ type: "movemouse", value: d }))
    })

    video.addEventListener("mousedown", (e) => {
        let right = false
        if (e.which === 3) right = true
        peer1.send(JSON.stringify({ type: "mousedown", right: right }))
    })

    video.addEventListener("mouseup", (e) => {
        let right = false
        if (e.which === 3) right = true
        peer1.send(JSON.stringify({ type: "mouseup", right: right }))
    })
    
    video.addEventListener("dblclick", (e) => {
        let right = false
        if (e.which === 3) right = true
        peer1.send(JSON.stringify({ type: "dblclick", right: right }))
    })

    let supportsPassive = false;
    try {
        window.addEventListener("test", null, Object.defineProperty({}, 'passive', {
            get: function () { supportsPassive = true; }
        }));
    } catch (e) { }

    let wheelOpt = supportsPassive ? { passive: false } : false;

    "wheel mousewheel DOMMouseScroll touchmove".split(" ").forEach((event) => {
        window.addEventListener(event, (e) => {
            e.preventDefault()
            console.log(event);
            console.log(e);
            peer1.send(JSON.stringify({ type: "scroll", value: {deltaX: e.deltaX, deltaY: e.deltaY }}))
        }, wheelOpt);
    });

    document.addEventListener("keydown", (e) => {
        e.preventDefault()
        document.getElementById("test").innerText += e.key
        peer1.send(JSON.stringify({ type: "keydown", key: e.key }))
    })

    document.addEventListener("keyup", (e) => {
        e.preventDefault()
        peer1.send(JSON.stringify({ type: "keyup", key: e.key }))
    })
})

peer1.on('data', (e, d) => {
    document.getElementById("ms").innerText = Date.now() - parseInt(e.toString())
})

peer1.on('stream', stream => {
    console.log("azeazeazeaz");
    // got remote video stream, now let's show it in a video tag
    var video = document.querySelector('video')

    video.srcObject = stream


    // video.addEventListener('timeupdate', (e) => {
    //     console.log(e);
    // })
})





// console.log(window.location.origin);

// const video = document.querySelector("video");
// const enableAudioButton = document.querySelector("#enable-audio");

// enableAudioButton.addEventListener("click", enableAudio)

// socket.on("offer", (id, description) => {
//     peerConnection = new RTCPeerConnection(config);
//     peerConnection
//         .setRemoteDescription(description)
//         .then(() => peerConnection.createAnswer())
//         .then(sdp => peerConnection.setLocalDescription(sdp))
//         .then(() => {
//             socket.emit("answer", id, peerConnection.localDescription);
//         });
//     peerConnection.ontrack = event => {
//         video.srcObject = event.streams[0];
//     };
//     peerConnection.onicecandidate = event => {
//         if (event.candidate) {
//             socket.emit("candidate", id, event.candidate);
//         }
//     };
// });


// socket.on("candidate", (id, candidate) => {
//     peerConnection
//         .addIceCandidate(new RTCIceCandidate(candidate))
//         .catch(e => console.error(e));
// });

// socket.on("connect", () => {
//     socket.emit("watcher");
// });

// socket.on("broadcaster", () => {
//     socket.emit("watcher");
// });

// window.onunload = window.onbeforeunload = () => {
//     socket.close();
//     peerConnection.close();
// };

// function enableAudio() {
//     console.log("Enabling audio")
//     video.muted = false;
// }