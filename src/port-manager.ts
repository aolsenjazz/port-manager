const midi = require("midi");
import { PortPairs, Port, PortPair } from "./ports";

const INPUT = new midi.Input();
const OUTPUT = new midi.Output();

let currentIns: string[] = [];
let currentOuts: string[] = [];

let availableDevices: PortPairs = new PortPairs();

let listeners = new Map();

/**
 * Scan the avaialbe midi ports and assemble the list of a available devices. Invoke listeners
 * if the new ports differeent from currentIns and/or currentOuts
 */
function scanPorts() {
  if (havePortsChanged()) {
    availableDevices.closeAll();

    const iPorts = parsePorts(INPUT, "input");
    const oPorts = parsePorts(OUTPUT, "output");

    const devices = new PortPairs();

    createPairsAndAddToDevices(iPorts, oPorts, devices);
    createPairsAndAddToDevices(oPorts, iPorts, devices);

    availableDevices = devices;

    const [ins, outs] = getPortNames();
    currentIns = ins;
    currentOuts = outs;

    availableDevices.openAll();

    listeners.forEach((cb) => {
      cb(availableDevices.pairs);
    });
  }
}

/**
 * Compare the lists of inputs and outs against the currentIns and currentOuts
 *
 * @return { bool } whether or not the ports have changed
 */
function havePortsChanged() {
  const [newIns, newOuts] = getPortNames();

  if (
    newIns.length != currentIns.length ||
    newOuts.length != currentOuts.length
  )
    return true;

  const insChanged = newIns.filter((val, i) => val != currentIns[i]).length;
  const outsChanged = newOuts.filter((val, i) => val != currentOuts[i]).length;

  return insChanged || outsChanged;
}

/**
 * Returns the lists of input and output names. Removes all ports whose name is ''. This is
 * *unfortunately* necessary because (at least on OSX 11.2), virtual ports will change their name
 * to '' before being full closed.
 */
function getPortNames() {
  const ins = [...Array(INPUT.getPortCount())].map((_val, i) =>
    INPUT.getPortName(i)
  );
  const outs = [...Array(OUTPUT.getPortCount())].map((_val, i) =>
    OUTPUT.getPortName(i)
  );
  return [ins.filter((name) => name != ""), outs.filter((name) => name != "")];
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

    // Gross safeguard. When closing virtual ports, the port disappears tho getPortCount still reports 1.
    // getPortName returns ''. Just ignore it when in this state.
    if (!name) continue;

    let nameOccurences: number = addedNames.filter((val) => val === name)
      .length;
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
    if (
      port.name === candidate.name &&
      port.occurrenceNumber === candidate.occurrenceNumber
    ) {
      sister = candidate;
    }
  });
  return sister;
}

/**
 * Pairs each `Port` in `portList` with it sister port in `sisterList` and added the resulting pair to
 * `portPairs` object if it doesn't already contain the pair.
 */
function createPairsAndAddToDevices(
  portList: Port[],
  sisterList: Port[],
  portPairs: PortPairs
) {
  portList.forEach((port) => {
    let sister = getSister(port, sisterList);

    let first = port.type === "input" ? port : sister;
    let second = port.type === "input" ? sister : port;

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
export function addListener(cb: (devices: PortPair[]) => void) {
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

export type { PortPair, Port };
