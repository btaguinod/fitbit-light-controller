import * as messaging from "messaging";

// URI="wss://ws.postman-echo.com/raw"
// URI="ws://10.0.0.157/ws"
// URI=:ws://10.0.0.200:5000/echo"
let wsUri = "wss://10.0.0.200:5000/echo";
let websocket;
function openWebSocket() {
  websocket = new WebSocket(wsUri);

  websocket.addEventListener("open", onOpen);
  websocket.addEventListener("close", onClose);
  websocket.addEventListener("message", onMessage);
  websocket.addEventListener("error", onError);
}
openWebSocket()

function onOpen(evt) {
  let message = "open test!"
  console.log("CONNECTED");
  websocket.send(message);
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    // Send the data to peer as a message
    messaging.peerSocket.send({"connected": true});
  }
}

function onClose(evt) {
  console.log("DISCONNECTED");
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    // Send the data to peer as a message
    messaging.peerSocket.send({"connected": false});
  }
}

function onMessage(evt) {
  console.log(`MESSAGE: ${evt.data}`);
}

function onError(evt) {
  console.error(`ERROR: ${evt.data} `);
  console.error(`${wsUri} failed`);
}

function calcHue(pitch, roll) {
  return (roll + 180)/360
}

function calcLightness(pitch, roll) {
  pitch += 20;
  let lightness;
  if (pitch >= 0) {
    lightness = 0.4;
  }
  else {
    lightness = 0.4 - 0.4*(-pitch)/60;
    lightness = Math.max(0, lightness);
  }
  return lightness;
}

messaging.peerSocket.addEventListener("message", (evt) => {
  const data = evt.data;
  if (evt.data["reset"] === true) {
    websocket.close();
    openWebSocket();
  } else {
    const data = evt.data;
    const hue = calcHue(data.pitch, data.roll);
    const lightness = calcLightness(data.pitch, data.roll);
    if (websocket.readyState === websocket.OPEN) {
      // Send the data to websocket
      websocket.send(hue + ':' + lightness);
    }
  }
});

import { settingsStorage } from "settings";

// Event fires when a setting is changed
settingsStorage.addEventListener("change", (evt) => {
  // Which setting changed
  console.log(`key: ${evt.key}`)

  // What was the old value
  console.log(`old value: ${evt.oldValue}`)

  // What is the new value
  console.log(`new value: ${evt.newValue}`)
});

// for controlling lights later
// const COLOR_MODES = {
//   PICK: "pick",
//   SCROLL: "scroll",
// };
// let scrollColor = 0;
// let color_mode = COLOR_MODES.SCROLL;
// const BRIGHTNESS_MODES = {
//   CONTROL: "control",
//   DISABLE: "disable",
// };
// let brightness_mode = BRIGHTNESS_MODES.DISABLE;