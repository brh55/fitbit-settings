# fitbit-settings 
[![Travis branch](https://img.shields.io/travis/brh55/fitbit-settings/main.svg?style=flat-square)](https://travis-ci.org/brh55/fitbit-settings) [![Coveralls branch](https://img.shields.io/coveralls/brh55/fitbit-settings/master.svg?style=flat-square)](https://coveralls.io/github/brh55/fitbit-settings) [![npm badge](https://img.shields.io/npm/dt/fitbit-settings.svg?style=flat-square)](https://www.npmjs.com/package/fitbit-settings)

> 🏴‍☠️ A dead simple module to assist managing and persisting user settings within Fitbit watch faces, applications, and companion.

`fitbit-settings` is designed to be a plug-and-play approach to help manage essential aspects of the user's settings within your watch faces and applications. 

It includes the the following goodies: 
- Persisting and retrieving of stored settings (device storage)
- Migration of stored settings upon changes to default settings
- Best-effort bi-directional syncing between companion and device for offline changes, device driven changes, and `settingsStorage` changes
- Automatically cast strings to associated types (i.e: "true" -> true)
- Event handlers for companion changes
- Chain-able methods for state management

This is intended to be be simple, light, and flat by nature. Thus, it doesn't handle nested settings, so be warned, *matey*.

**Note:** This module is designed to only works for Fitbit OS (JerryScript) and still in *alpha* for some potential bugs.

## Install

```
$ npm install --save fitbit-settings
```

## Lifecycle
**On initializing**
1. The device will update it's state by retrieve any pre-existing settings stored on the device and migrate any new setting properties found in the default settings.

**On listening**
1. The device will sync the companion with it's current settings 
    1. The companion will parse the differences and notify the device of the changes that may have occurred when disconnected
    2. The device will update the properties with the missing changes and save them to the device
2. The device will listen for changes done within the settings app or `settingsStorage` and automatically update the settings stored in the device
3. If the `syncWithCompanion` option is set, the device will persist any changes through the `.update()` method to the companion, the companion will then update the `settingsStorage`

## Usage
It's recommended to keep things as flat as possible, and prefix properties if need be (i.e `color_background`, `display_battery`). This will keep the settings lean and prevent unexpected overrides of settings upon reboots and migrations.

### Simple - Device Only
```js
import FsSettings from 'fitbit-settings/app';

const defaultSettings = {
    color_background: '#000',
    color_label: '#fff',
    hide_battery: false,
    tap_disable: true,
    color_hour: '#000cec9',
    color_minute: '#fff',
    color_battery: '#fff'
});

const appSettings = new FsSettings(defaultSettings);

// Update settings (color_battery, color_hour)
// Persist to Device Disk
appSettings
    .update('color_battery', 'red')
    .update('color_hour', 'yellow')
    .save();

// Reset to default settings
// Persist to disk
appSettings.reset().save();

// Set style based on settings
document.getElementById('battery').style.fill = appSettings.getProp('color_battery');
```

### Advance - Companion and Device
Make sure to utilize the same defaults across a common export to act as a source of truth.

**Common Files: `/common/default-settings.js**
```js
export const defaultSettings = {
    color_background: '#000',
    color_label: '#fff',
    hide_battery: false,
    tap_disable: true,
    color_hour: '#000cec9',
    color_minute: '#fff',
    color_battery: '#fff'
});
```

Initialize with default settings within a singleton to use across different files and activate the `listen` method.

**App File: /app/settings.js**
```js
import FsSettings from 'fitbit-settings/app';
import defaultSettings from './common/defaultSettings';

const appSettings = new FsSettings(defaultSettings, {
    // set to true if you want to allow your watch face UI to make changes to the settings
    syncWithCompanion: true,
    callListenersOnInit: true
};

// Register event handlers that will get called every time this changes from the companion as well as called upon when the watchface initially loads
appSettings.onPropChange('color_background', 
    (event) => setBackgroundColor(event.data.value));
appSettings.onPropChange('color_hour', event => setHourColor(event.data.value));

// Update and sync changes with companion if connection exists
appSettings.listen();

// Update the settings based on events in the UI,
// but also update the companion settings
if (userClickedElement) {
    appSettings.update('tap_disable', false);
}
```

**Companion File**
```js
import defaultSettings from './common/defaultSettings';

const companionSettings = new FsSettings(defaultSettings);
companionSettings.listen();
```

## fitbit-settings/app API

### Settings()
**Type:** `class`<br>
**Usage:** `new FsSettings(defaultSettings, options)`

#### defaultSettings
**Type:** `object`<br>
Default settings for the application / watch face

#### options
**Type:** `object`<br>

##### options.filePath
**Type:** `string`<br>
Override the default file path ('settings.cbor').

##### options.syncWithCompanion
**Type:** `boolean`<br>
Allow updates to notify the companion / setting storage. This is typically for when you may allow the user to update the settings within the watch face.

##### options.callListenersOnInit
**Type:** `boolean`<br>
Upon calling `listen()`, fitbit-settings will also call all `.onPropChange` listeners with its current values. This is useful for watchfaces with listeners that need to be called on initialization.

## Instance Methods
### .listen()
**Returns:** `instance`<Settings>
Activate listeners to watch for changes in the companion, this requires the settings to also be listening in the companion side.

### .onPropChange(propName, callback)
**Returns:** `instance`<Settings>
Register callbacks for companion changes that occur when listening. Limited to 1 callback per a propName.

### .getProp(propName)
**Returns:** Value of prop stored in memory state

#### propName
**Type:** `string`<br>

Prop of setting to retrieve `IE: 'color_battery'`

### .update(prop, value)
**Returns:** `instance`<Settings>

Updates the current setting state within the app. If no prop currently exists, this will create a new one. In addition, syncWithCompanion will notify the companion of this update.

#### prop
**Type:** `string`<br>

#### value
**Type:** `any`<br>

### .save()
Returns class `instance`

Persist existing setting state to watch disk.

### .reset()
Returns class `instance`

Reset internal setting state back to default settings


## fitbit-settings/companion API
### Settings()
**Type:** `class`<br>
**Usage:** `new FsSettings(defaultSettings)`

## Instance Methods
### .listen()
Activate listeners to watch for notifications from the device and notify the device for property changes in the settings storage / settings app.

## Contribute
All files are written within the `src` directory and compiled to to ES5 to support the Fitbit JavaScript runtime. Once the files are built, these are outputted to the project's root directory. In order to build these files, run `npm run build`.

Prior to publishing or submitting a pull request, it's best to include some test/spec files. The test suite uses [Jest](https://jestjs.io/), and can the suite can be executed with `npm run test`.

If you need any help, feel free to submit an issue.

## Used By
`fitbit-settings` is currently being used in these production watch faces and applications:

- [Pixels on Ridge](https://pixelsonridge.com)

> If you are using, `fitbit-settings`, feel free to add your studio by submitting a GitHub issue


## License

MIT © [Brandon Him](https://github.com/brh55/fitbit-settings)
