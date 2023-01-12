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
    messaging.peerSocket.send({
      input: "connected",
      connected: true
    });
  }
}

function onClose(evt) {
  console.log("DISCONNECTED");
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    // Send the data to peer as a message
    messaging.peerSocket.send({
      input: "connected",
      connected: false
    });
  }
}

function onMessage(evt) {
  console.log(`MESSAGE: ${evt.data}`);
}

function onError(evt) {
  console.error(`ERROR: ${evt.data} `);
  console.error(`${wsUri} failed`);
}

// for controlling lights later
const COLOR_MODES = {
  PICK: "pick",
  SCROLL: "scroll",
};
let hue = 0;
let color_mode = COLOR_MODES.PICK;
const LIGHTNESS_MODES = {
  CONTROL: "control",
  DISABLE: "disable",
};
let lightness_mode = LIGHTNESS_MODES.CONTROL;
let lightness = 0.5;

function calcHue(pitch, roll) {
  if (color_mode === COLOR_MODES.PICK) {
    hue = (roll + 180)/360
  } else {
    hue += (roll/180)
    if (hue < 0) {
      hue = 1;
    } else if (hue > 1) {
      hue = 0;
    }
  }
}

function calcLightness(pitch, roll) {
  if (lightness_mode === LIGHTNESS_MODES.CONTROL) {
    pitch += 20;
    if (pitch >= 0) {
      lightness = 0.5;
    }
    else {
      lightness = 0.5 - 0.5*(-pitch)/60;
      lightness = Math.max(0, lightness);
    }
  } else {
    lightness = 0.5;
  }
}

messaging.peerSocket.addEventListener("message", (evt) => {
  const data = evt.data;
  const inputType = data["input"];
  if (inputType === "orientation") {
    calcHue(data.pitch, data.roll);
    calcLightness(data.pitch, data.roll);
    if (websocket.readyState === websocket.OPEN) {
      // Send the data to websocket
      websocket.send(hue + ':' + lightness);
    }
  } else if (inputType === "reset") {
    websocket.close();
    openWebSocket();
  } else if (inputType === "color-mode") {
    if (color_mode === COLOR_MODES.PICK) {
      color_mode = COLOR_MODES.SCROLL;
    } else {
      color_mode = COLOR_MODES.PICK;
    }
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
      // Send the data to peer as a message
      messaging.peerSocket.send({
        input: "color",
        color: color_mode,
      });
    }
  } else if (inputType === "lightness-mode") {
    if (lightness_mode === LIGHTNESS_MODES.CONTROL) {
      lightness_mode = LIGHTNESS_MODES.DISABLE;
    } else {
      lightness_mode = LIGHTNESS_MODES.CONTROL;
    }
    if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
      // Send the data to peer as a message
      messaging.peerSocket.send({
        input: "lightness",
        lightness: lightness_mode,
      });
    }
  } else {
    throw new Error("Invalid watch to phone input type: " + inputType);
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

