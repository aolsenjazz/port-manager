# port-manager

![AppVeyor](https://img.shields.io/appveyor/build/aolsenjazz/midi-port-manager)
[![Maintainability](https://api.codeclimate.com/v1/badges/8e80dd774b35110358de/maintainability)](https://codeclimate.com/github/aolsenjazz/midi-port-manager/maintainability)
![Depfu](https://img.shields.io/depfu/aolsenjazz/port-manager)
[![Coverage Status](https://coveralls.io/repos/github/aolsenjazz/midi-port-manager/badge.svg?branch=main)](https://coveralls.io/github/aolsenjazz/port-manager?branch=main)

Port manager simplifies interacting with MIDI devices by providing a layer of abstraction on top of the [rt-midi](https://www.npmjs.com/package/midi) API. Rather than interacting with individual input and output ports, pairs of input+output ports are grouped together and thought of as a single device (`PortPair` in code). Devices also provide convenience methods for interacting with the underlying ports.

### Features
- Automatically couple input and output ports
- Automatically distinguishes between ports with the same name; "APC" and "APC" become "APC0" and "APC1"
- Invokes callbacks when list of available devices changes

## Installation

Install using NPM:
```bash
npm i @alexanderolsen/port-manager
```
or yarn:
```bash
yarn add @alexanderolsen/port-manager
```

## Usage

```javascript
const manager = require('@alexanderolsen/port-manager')

let listenerId = manager.addListener((devices) => {
  devices.forEach((device) => {
    console.log(device.id, device.name, device.hasInput, device.hasOutput);
  });
});
```
or
```javascript
// If transpiling, you can use `import`s
import { get } from '@alexanderolsen/port-manager';

let deviceName = 'MidiDevice';
let deviceId = 'MidiDevice0'; // {deviceName}{nth device with the given name}
let device = get(deviceId);

device.send([172, 22, 1]);
device.onMessage((deltaTime, message) => {
  // do something with the message
});

device.close();
```

## API Reference

The `require`'d object exposes:
```javascript
/**
 * Add a callback to be invoked if the list of available MIDI ports changes.
 *
 * @param  { Function } cb The function to be invoked
 * @return { string }      The id used to remove the listener using `removeListener(id)`
 */
export function addListener(cb) {...}

/**
 * Remove the listener associated with the given id.
 *
 * @param  { string } id The id associated with the callback. Received from `addListener(cb)`
 */
export function removeListener(id) {...}

/**
 * Return a list of all of the available devices
 * @return { PortPair[] } Array of `PortPair`s
 */
export function all() {...}

/**
 * Returns the device with the given id, or null if no such device exists.
 * 
 * @param  { string }   id String formatted `{DeviceName}{nth occurrence of device (if multiple devices with same name)}`
 * @return { PortPair }    A representation of both input and output ports
 */
export function get(id) {...}
```

### `PortPair`
`get` and `all` return a `PortPair` and a `PortPair[]` respectively. `PortPair`s can be thought of as one singular device which has the following API:

````javascript
/**
 * Couples input and output ports. Each pair doesn't necessarily have to have both an input and
 * output port; pairs of (iPort && null) or (null ** oPort) may exist.
 */
class PortPair {

  /**
   * Open the input and/or output ports if not null.
   */
  open() {...}

  /**
   * Open the input and/or output ports if not null.
   */
  close() {...}

  /**
   * Send a message through the output port. If output port is null, does nothing.
   */
  send(msg) {}

  /**
   * Set a callback to be invoked when the input port receives a message. If input port is null, does nothing.
   */
  onMessage(cb) {}

  /** getters */
  get id() { ... } // `{deviceName}{occurrenceNumber}`
  get name() { ... } // device name
  get hasInput() { ... } // is input port != null?
  get hasOutput() { ... } // is output port != null?
  get occurrenceNumber() { ... } // nth device with the given name
  
}
````

## Building From Source

```bash
git clone https://github.com/aolsenjazz/port-manager
cd port-manager
npm run build
```

Production files are placed in the *build* directory.

## Examples

To run the examples:
````shell
cd examples
node notifications.js
node on-message.js
````

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

Licenses are available in `LICENSE.md`.