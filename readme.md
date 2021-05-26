# fitbit-settings 
[![Travis branch](https://img.shields.io/travis/brh55/fitbit-settings/main.svg?style=flat-square)](https://travis-ci.org/brh55/fitbit-settings) [![Coveralls branch](https://img.shields.io/coveralls/brh55/fitbit-settings/master.svg?style=flat-square)](https://coveralls.io/github/brh55/fitbit-settings) [![npm badge](https://img.shields.io/npm/dt/fitbit-settings.svg?style=flat-square)](https://www.npmjs.com/package/fitbit-settings)

> 🏴‍☠️ A dead simple module to assist managing and persisting user settings within Fitbit watch faces and applications

`fitbit-settings` is designed to be a simple way to help manage essential aspects of user settings within your watch faces and applications. It includes some common goodies like persisting to disk, chainable methods for managing state, and migration handling. Given it's simple nature, it doesn't handle complex scenarios well such as nested properties, so be warned, *matey*.

**Note:** This module is designed to only works for Fitbit OS (JerryScript).

## Install

```
$ npm install --save fitbit-settings
```

## Usage
It's recommended to keep things as flat as possible, and prefix properties if need be. This will keep the settings lean, and prevent unexpected overrides of settings upon reboots.

When initialize `fitbit-settings` will retrieve pre-existing stored settings on the device, and update the stored settings with any new default settings passed in the constructor. This is done automatically to prevent issues that occur when adding new settings on an updated build.

```js
import Settings from 'fitbit-settings';

const defaultSettings = {
    color_background: '#000',
    color_label: '#fff',
    hide_battery: false,
    tap_disable: true,
    color_hour: '#000cec9',
    color_minute: '#fff',
    color_battery: '#fff'
});

const appSettings = new Settings(defaultSettings);

// Update State and Persist to Disk

appSettings
    .update('color_battery', 'red')
    .update('color_hour', 'yellow')
    .save();

appSettings.reset().save(); // Reset user settings and update disk

// Set style based on settings
document.getElementById('battery').style.fill = appSettings.getProp('color_battery');
```

## API

### Settings()
**Type:** `class`<br>
**Usage:** `new Settings(defaultSettings, filePath)`

#### defaultSettings
**Type:** `object`<br>
Default settings for the application / watch face

#### filePath
**Type:** `string`<br>
Override the default file path ('settings.cbor').

## Instance Methods
### .getProp(propName)
**Returns:** Value of prop stored in memory state

#### propName
**Type:** `string`<br>

Prop of setting to retrieve `IE: 'color_battery'`

### .update(prop, value)
Returns class `instance`

If no prop currently exists, this will create a new one.

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

## Used By
`fitbit-settings` is currently being used in these production watch faces and applications:

- [Pixels on Ridge](https://pixelsonridge.com)

> If you are using, `fitbit-settings`, feel free to add your studio by submitting a GitHub issue

## License

MIT © [Brandon Him](https://github.com/brh55/fitbit-settings)
