const manager = require('../build/ports.js');
const midi = require('midi');

let id = manager.addListener((deviceList) => {
  console.log(`Available devices: ${deviceList.length}`);
});

setInterval(() => {
  const input = new midi.Input();
  input.openVirtualPort('virtual port');
}, 1000);