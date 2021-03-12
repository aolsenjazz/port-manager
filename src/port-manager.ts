const midi = require('midi');
// const ports = require('./ports');
import { PortPairs, Port, PortPair } from './ports';

const INPUT = new midi.Input();
const OUTPUT = new midi.Output();
let availableDevices: PortPairs = new PortPairs();
let listeners = new Map();

/**
 * Scan the avaialbe midi ports and assemble the list of a available devices. Invoke listeners
 * if available devices is different than last scan.
 */
function scanPorts() {
  const iPorts = parsePorts(INPUT, 'input');
  const oPorts = parsePorts(OUTPUT, 'output');
  
  const devices = new PortPairs();

  createPairsAndAddToDevices(iPorts, oPorts, devices);
  createPairsAndAddToDevices(oPorts, iPorts, devices);

  if (JSON.stringify(devices) != JSON.stringify(availableDevices)) {
    availableDevices.closeAll(); // clean up
    
    availableDevices = devices;
    availableDevices.openAll();

    listeners.forEach((cb) => {
      cb(availableDevices.pairs);
    })
  }
}

/**
 * Convert the available ports accessed via midi.Input || midi.Output into a more usable list
 * of `Port` objects.
 */
function parsePorts(parent: any, type: string) {
  let ports: Port[] = [];
  let addedNames: string[] = [];
  for (let i = 0; i < parent.getPortCount(); i++) {
    let name: string = parent.getPortName(i);

    // Gross safeguard. When closing Blueboard, the ports disappears tho getPortCount still reports 1.
    // getPortName returns ''. Just ignore it when in this state.
    if (!name) continue; 

    let nameOccurences: number = addedNames.filter((val) => val === name).length;
    ports.push(new Port(i, nameOccurences, type, name));
    addedNames.push(name);
  }

  return ports;
}

/**
 * Retrieves the sister port from the given list of possible sister candidates. A port is considered
 * a sister port if both the port names and occurrences match.
 */
function getSister(port: Port, sisterList: Port[]) {
  let sister: Port | null = null;
  sisterList.forEach((candidate) => {
    if (port.name === candidate.name && port.occurrenceNumber === candidate.occurrenceNumber) {
      sister = candidate;
    }
  });
  return sister;
}

/**
 * Pairs each `Port` in `portList` with it sister port in `sisterList` and added the resulting pair to
 * `portPairs` object if it doesn't already contain the pair.
 */
function createPairsAndAddToDevices(portList: Port[], sisterList: Port[], portPairs: PortPairs) {
  portList.forEach((port) => {
    let sister = getSister(port, sisterList);

    let first = port.type === 'input' ? port : sister;
    let second = port.type === 'input' ? sister : port;

    let pair = new PortPair(first, second);

    if (!portPairs.contains(pair)) {
      portPairs.push(pair);
    }
  });
}

/**
 * Generate a random string of given length
 * 
 * @param { Number } length Length of the string
 */
function randomString(length: number) {
  return Math.random().toString(36).substring(0, length);
}

scanPorts();
setInterval(() => scanPorts(), 100);

/**
 * Add a callback to be invoked if the list of available MIDI ports changes.
 *
 * @param  { Function } cb The function to be invoked
 * @return { string }      The id used to remove the listener using `removeListener(id)`
 */
export function addListener(cb: Function) {
  let id = randomString(7);
  listeners.set(id, cb);
  return id;
}

/**
 * Remove the listener associated with the given id.
 *
 * @param  { string } id The id associated with the callback. Received from `addListener(cb)`
 */
export function removeListener(id: string) {
  listeners.delete(id);
}

/**
 * Return a list of all of the available devices
 * @return { PortPair[] } Array of `PortPair`s
 */
export function all() {
  return availableDevices.pairs;
}

/**
 * Returns the device with the given id, or null if no such device exists.
 * 
 * @param  { string }   id String formatted `{DeviceName}{nth occurrence of device (if multiple devices with same name)}`
 * @return { PortPair }    A representation of both input and output ports
 */
export function get(id: string) {
  return availableDevices.get(id);
}

/**
 * Close all connections to ports. All ports are automatically connected when available ports change.
 */
export function closeAll() {
  availableDevices.closeAll();
}