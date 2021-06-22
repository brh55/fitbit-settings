# fitbit-settings 
[![Travis branch](https://img.shields.io/travis/brh55/fitbit-settings/main.svg?style=flat-square)](https://travis-ci.org/brh55/fitbit-settings) [![Coveralls branch](https://img.shields.io/coveralls/brh55/fitbit-settings/master.svg?style=flat-square)](https://coveralls.io/github/brh55/fitbit-settings) [![npm badge](https://img.shields.io/npm/dt/fitbit-settings.svg?style=flat-square)](https://www.npmjs.com/package/fitbit-settings)

> 🏴‍☠️ A dead simple module to assist managing and persisting user settings within Fitbit watch faces, applications, and companion.

`fitbit-settings` is designed to be a brainless way to help manage essential aspects of user settings within your watch faces and applications. 

It includes the common goodies: 
- Persisting and retrieving of stored settings (device storage)
- Chain-able methods for state management
- Migration of stored settings upon changes to default settings
- Best-effort bi-directional syncing between companion and device for offline changes, device driven changes, and `settingsStorage` changes
- Event handlers for companion changes

This is intended to be be simple, small (<20 kB), and flat by nature. Thus, it doesn't handle nested settings, so be warned, *matey*.

**Note:** This module is designed to only works for Fitbit OS (JerryScript) and still in *alpha* for some potential bugs.

## Install

```
$ npm install --save fitbit-settings
```

## Usage
It's recommended to keep things as flat as possible, and prefix properties if need be. This will keep the settings lean, and prevent unexpected overrides of settings upon reboots.

When initialize `fitbit-settings` will retrieve pre-existing stored settings on the device, and update the stored settings with any new default settings passed in the constructor. This is done automatically to prevent issues that occur when adding new settings on an updated build.

### Simple - Device Side Only

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

// Update State and Persist to Disk

appSettings
    .update('color_battery', 'red')
    .update('color_hour', 'yellow')
    .save();

appSettings.reset().save(); // Reset user settings to default settings and update disk

// Set style based on settings
document.getElementById('battery').style.fill = appSettings.getProp('color_battery');
```

### Advance - Companion and Device Side
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
    syncWithCompanion: true // set to true if you want to allow your watch face UI to make changes to the settings
};

// Register event handlers that will get called every time this changes from the companion
appSettings.onPropChange('color_background', (event) => { doSomething(event) });
appSettings.onPropChange('color_hour', (event) => { 
    setHourColor(event.data.value);
});

// Update and sync changes with companion if connection exists
appSettings.listen();

// Make settings changed in the UI
appSettings.update('tap_disable', false);
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


## Used By
`fitbit-settings` is currently being used in these production watch faces and applications:

- [Pixels on Ridge](https://pixelsonridge.com)

> If you are using, `fitbit-settings`, feel free to add your studio by submitting a GitHub issue

## License

MIT © [Brandon Him](https://github.com/brh55/fitbit-settings)
