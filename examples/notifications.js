const midi = require('midi');
const manager = require('../build/port-manager.js');

let id = manager.addListener((deviceList) => {
  console.log(`Available devices: ${deviceList.length}`);
});

setInterval(() => {
  const input = new midi.Input();
  input.openVirtualPort('virtual port');
}, 1000);