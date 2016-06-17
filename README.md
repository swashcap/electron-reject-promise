# Electron Reject Promise

This repository demonstrates a [remote](http://electron.atom.io/docs/api/remote/)-related bug with [Electron](http://electron.atom.io).

## Setup

Make sure you have git, Node.js (and npm) installed. Then:

1. `git clone` the repository
2. Run `npm install` in the repo’s directory to get the dependencies
3. Run `npm start` to fire up the app

## Running The Tests

<img src="https://raw.githubusercontent.com/swashcap/electron-reject-promise/master/img/screenshot.jpg" alt="app screenshot" />

The “Name” field is considered “valid” if it’s greater than 4 characters long.

### Synchronously

Click “Validate Synchronously” to test the remote synchronous (`throw Error`)-based validation. Electron **doesn’t blow up** on invalid input. You should see:

<img src="https://raw.githubusercontent.com/swashcap/electron-reject-promise/master/img/sync-error.jpg" alt="Synchronous error display" />

### With Promises

Click “Validate With Promise” to test the remote Promise-based validation. Electron **blows up** up on invalid input. You’ll see something like this in your terminal:

```shell
Unhandled rejection at: Promise  Promise {
  <rejected> Error: Name must have at least 4 characters
    at Object.validateName [as validateWithPromise] (/Users/creed/Sites/electron-reject-promise/main/validation-service.js:25:29)
    at callFunction (/Users/creed/Sites/electron-reject-promise/node_modules/electron-prebuilt/dist/Electron.app/Contents/Resources/electron.asar/browser/rpc-server.js:214:18)
    at EventEmitter.<anonymous> (/Users/creed/Sites/electron-reject-promise/node_modules/electron-prebuilt/dist/Electron.app/Contents/Resources/electron.asar/browser/rpc-server.js:303:5)
    at emitMany (events.js:127:13)
    at EventEmitter.emit (events.js:201:7)
    at EventEmitter.<anonymous> (/Users/creed/Sites/electron-reject-promise/node_modules/electron-prebuilt/dist/Electron.app/Contents/Resources/electron.asar/browser/api/web-contents.js:165:13)
    at emitTwo (events.js:106:13)
    at EventEmitter.emit (events.js:191:7) }  reason:  Error: Name must have at least 4 characters
    at Object.validateName [as validateWithPromise] (/Users/creed/Sites/electron-reject-promise/main/validation-service.js:25:29)
    at callFunction (/Users/creed/Sites/electron-reject-promise/node_modules/electron-prebuilt/dist/Electron.app/Contents/Resources/electron.asar/browser/rpc-server.js:214:18)
    at EventEmitter.<anonymous> (/Users/creed/Sites/electron-reject-promise/node_modules/electron-prebuilt/dist/Electron.app/Contents/Resources/electron.asar/browser/rpc-server.js:303:5)
    at emitMany (events.js:127:13)
    at EventEmitter.emit (events.js:201:7)
    at EventEmitter.<anonymous> (/Users/creed/Sites/electron-reject-promise/node_modules/electron-prebuilt/dist/Electron.app/Contents/Resources/electron.asar/browser/api/web-contents.js:165:13)
    at emitTwo (events.js:106:13)
    at EventEmitter.emit (events.js:191:7)
```

## Bug

* Electron version: 1.2.2
* Operating system: OS X 10.11.5

Electron treats `Promise.reject` responses in a remotely invoked call as unhandled rejections in the main process.

As an example, here’s the validation function, which lives in the main process:

```js
function validateWithPromise(name) {
  if (!name || name.length < 4) {
    return Promise.reject(new Error('Name must have at least 4 characters'));
  }

  return Promise.resolve(name);
}
```

And here’s the validation, which lives in the render process.

```js
const validateWithPromise = require('electron').remote.require('./path/to/validate-with-promise');

validateWithPromise(myName)
  .then(() => console.log('myName is valid!'))
  .catch(error => console.error('myName is invalid:', error.message));
```

Unfortunately, an invalid `myName` causes an `unhandledReject` in the _main_ process. I expect the RPC server serialize the rejection for handling in the remote process, _not_ in the main process.
