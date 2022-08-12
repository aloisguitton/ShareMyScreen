const { spawn } = require("child_process")

let c = {
    "Meta": "cmd",
    "Shift": "shift",
    "Control": "ctrl",
    "Alt": "alt",
}

module.exports = class Controller {
    constructor() {
        this.pythonProcess = spawn('python3', ["-u", "/Users/aloisguitton/Documents/ShareMyScreen/controllerjs/main.py"]);
        this.pythonProcess.stdout.on("data", function (data) {
            console.log(data.toString());
        });

        this.pythonProcess.stderr.on("data", function (data) {
            console.log(data.toString());
        });
    }

    #formatKey = (key) => {
        switch (key) {
            case " ":
                return "space"
            case "Dead":
                return "^"
            case "Backspace":
                return "backspace"
            case "Enter":
                return "enter"
            case "Tab":
                return "tab"
            default:
                return key.toLowerCase()
        }
    }

    interaction = (type, key, specialKey = []) => {
        if (type === "press") {
            specialKey.map(k => {
                specialKey = c[k]
            })
            key = this.#formatKey(key)
        } else {
            if (Object.keys(c).includes(key)) {
                key = c[key]
            }
            key = this.#formatKey(key)
        }

        this.pythonProcess.stdin.write(`${type} ${key} ${specialKey.toString()} \n`);
    }

    press = (key, specialKey) => {
        if (typeof specialKey === "string") specialKey = [specialKey]
        this.interaction("press", key, specialKey)
    }

    release = (key) => {
        this.interaction("release", key)
    }

    moveMouse = (x, y) => {
        this.pythonProcess.stdin.write(`movemouse ${parseInt(x)} ${parseInt(y)} \n`);
    }

    scroll = (x, y) => {
        this.pythonProcess.stdin.write(`scroll ${parseInt(x)} ${parseInt(y)} \n`);
    }

    click = (type, which) => {
        this.pythonProcess.stdin.write(`click ${type} ${which} \n`);
    }
}