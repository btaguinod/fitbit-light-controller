console.log("companion init");

const wsUri = "wss://socketsbay.com/wss/v2/1/demo/";
const websocket = new WebSocket(wsUri);

websocket.addEventListener("open", onOpen);
websocket.addEventListener("close", onClose);
websocket.addEventListener("message", onMessage);
websocket.addEventListener("error", onError);

function onOpen(evt) {
  let message = "open test!"
  console.log("CONNECTED");
  websocket.send(message);
}

function onClose(evt) {
   console.log("DISCONNECTED");
}

function onMessage(evt) {
   console.log(`MESSAGE: ${evt.data}`);
}

function onError(evt) {
   console.error(`ERROR: ${evt.data}`);
}

import * as messaging from "messaging";

messaging.peerSocket.addEventListener("message", (evt) => {
  console.error(JSON.stringify(evt.data));
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