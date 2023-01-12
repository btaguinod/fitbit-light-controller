import { Accelerometer } from "accelerometer";
import * as document from "document";
import * as messaging from "messaging";

let isActive = false;

let accelerometer
if (Accelerometer) {
  accelerometer = new Accelerometer({ frequency: 10 });
  const pitch = document.getElementById("pitch");
  const roll = document.getElementById("roll");
  function dist(a, b) {
    let result = Math.sqrt((Math.pow(a,2) + Math.pow(b,2)));
    return result;
  }
  accelerometer.addEventListener("reading", () => {
    let ax = accelerometer.x;
    let ay = accelerometer.y;
    let az = accelerometer.z;
    const G = 0.806;
    // from https://stackoverflow.com/questions/3755059/3d-accelerometer-calculate-the-orientation
    let pitchVal = Math.atan2(ax, dist(ay, az))*180/Math.PI;
    let miu = 0.01
    let sign = az > 0 ? 1 : -1
    let rollVal = Math.atan2(ay, sign*dist(ax*miu, az))*180/Math.PI;
    pitch.text = "pitch: " +  pitchVal.toString().slice(0, 5) + "deg";
    roll.text = "roll: " + rollVal.toString().slice(0, 5) + "deg";
    
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
      // Send the data to peer as a message
      messaging.peerSocket.send({
        input: "orientation",
        pitch: pitchVal, 
        roll: rollVal
      });
    }
  });
} else {
   console.log("This device does NOT have an Accelerometer!");
}

messaging.peerSocket.addEventListener("error", (err) => {
  console.error(`Connection error: ${err.code} - ${err.message}`);
});

const activateButton = document.getElementById("activate-button");

activateButton.addEventListener("click", (evt) => {
  isActive = !isActive;
  if (isActive == false) {
    accelerometer.stop();
  } else {
    accelerometer.start();
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
      // Send the data to peer as a message
      messaging.peerSocket.send({input: "reset"});
    }
  }
})

const colorModeButton = document.getElementById("color-mode-button");

colorModeButton.addEventListener("click", (evt) => {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    // Send the data to peer as a message
    messaging.peerSocket.send({input: "color-mode"});
  }
})

const lightnessModeButton = document.getElementById("lightness-mode-button");

lightnessModeButton.addEventListener("click", (evt) => {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    // Send the data to peer as a message
    messaging.peerSocket.send({input: "lightness-mode"});
  }
})

const connectedText = document.getElementById("connected");

messaging.peerSocket.addEventListener("message", (evt) => {
  const data = evt.data;
  const inputType = evt.data["input"];
  if (inputType === "connected") {
    if (data["connected"] === true) {
      connectedText.text = "Connected";
    } else {
      connectedText.text = "Not Connected";
    }
  } else if (inputType === "color") {
    colorModeButton.text = "COLOR: " + data["color"].toUpperCase();
  } else if (inputType === "lightness") {
    lightnessModeButton.text = "LIGHTNESS: " + data["lightness"].toUpperCase();
  } else {
    throw new Error("Invalid phone to watch input type: " + inputType);
  }
});