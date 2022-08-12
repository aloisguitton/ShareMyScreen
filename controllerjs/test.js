const spawn = require("child_process").spawn;


const pythonProcess = spawn('python3',["-u", "test.py"]);
pythonProcess.stdout.on('data', (data) => {
  console.log("PYTHON SENT:", data.toString());
});

let count = 0;

setInterval(function() {
  pythonProcess.stdin.write(`12345:2 analogInput ${count++}\n`);
}, 1000);