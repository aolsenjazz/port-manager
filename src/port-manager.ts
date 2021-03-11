const midi = require('midi');

const INPUT = new midi.Input();
const OUTPUT = new midi.Output();
let availableDevices: PortPairs;
let listeners = new Map();
let interval: any;

/**
 * Initialize some values, and begin listening 
 *
 * @param { number } intervalMs The number of miliseconds between each port scan
 */
function init(intervalMs: number) {
  availableDevices = new PortPairs();

  interval = setInterval(() => {
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
  }, intervalMs);
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

/**
 * Basic information about an available port. If multiple ports are available with the same namem,
 * keep track of which one it is using `occurrenceNumber`
 */
 
class Port {

  index: number;
  occurrenceNumber: number;
  type: string;
  name: string;
  port: any;

  constructor(index: number, occurrenceNumber: number, type: string, name: string) {
    this.index = index;
    this.occurrenceNumber = occurrenceNumber;
    this.type = type;
    this.name = name;

    this.port = type === 'input' ? new midi.Input() : new midi.Output();
  }

  open() { this.port.openPort(this.index); }
  close() { this.port.closePort(); }
  
  send(msg: []) { 
    this.port.sendMessage(msg);
  }
  onMessage(cb: Function) {
    this.port.on('message', cb);
  }

}

/**
 * Couples input and output ports. Each pair doesn't necessarily have to have both an input and
 * output port; pairs of (iPort && null) or (null ** oPort) may exist.
 */
class PortPair {

  iPort: Port | null;
  oPort: Port | null;

  constructor(iPort: Port | null, oPort: Port | null) {
    this.iPort = iPort;
    this.oPort = oPort;
  }

  /**
   * Open the input and/or output ports if not null.
   */
  open() {
    if (this.iPort !== null) this.iPort.open();
    if (this.oPort !== null) this.oPort.open();
  }

  /**
   * Open the input and/or output ports if not null.
   */
  close() {
    if (this.iPort !== null) this.iPort.close();
    if (this.oPort !== null) this.oPort.close();
  }

  /**
   * Send a message through the output port. If output port is null, does nothing.
   */
  send(msg: []) {
    if (this.oPort !== null) this.oPort.send(msg);
  }

  /**
   * Set a callback to be invoked when the input port receives a message. If input port is null, does nothing.
   */
  onMessage(cb: Function) {
    if (this.iPort !== null) {
      this.iPort.onMessage(cb);
    }
  }

  /** getters */
  get hasInput() { return this.iPort != null; }
  get hasOutput() { return this.oPort != null; }
  get name() { return this.iPort != null ? this.iPort.name : this.oPort!.name }
  get occurrenceNumber() { return this.iPort != null ? this.iPort.occurrenceNumber : this.oPort!.occurrenceNumber }
  get id() { return `${this.name}${this.occurrenceNumber}` }
}

/**
 * Wrapper around a list of `PortPair`s. 
 */
class PortPairs {

  pairs: PortPair[] = [];

  constructor() {}

  /**
   * Does `pairs` already contain the given port pair?
   */
  contains(portPair: PortPair) {
    let _contains = false;
    this.pairs.forEach((p) => {
      if (portPair.name === p.name && portPair.occurrenceNumber === p.occurrenceNumber) {
        _contains = true;
      }
    });

    return _contains;
  }

  push(pair: PortPair) {
    this.pairs.push(pair);
  }

  get(id: string) {
    for (let i = 0; i < this.pairs.length; i++) {
      if (this.pairs[i].id === id) return this.pairs[i];
    }

    return null;
  }

  openAll() {
    this.pairs.forEach((pair) => {
      pair.open();
    });
  }

   closeAll() {
     this.pairs.forEach((pair) => {
       pair.close();
     });
   }
}

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

/**
 * Begin listening to all port changes.
 *
 * @param { number } interval Number of miliseconds between each port scan.
 */
export function start(interval: number) {
  init(interval);
}

/**
 * Close all ports and stop listening.
 */
export function stop() {
  closeAll();
  clearInterval(interval);
}